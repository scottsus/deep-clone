import asyncio
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
from queue import Empty, Queue
from time import time
from typing import Any, Dict, Tuple

from app.db import get_db
from app.lib.ai import LLM, Anthropic, OpenAI
from app.lib.logger import get_logger
from app.lib.types.message import Message
from app.lib.types.packet import Packet, ServerSendSignal
from app.services.stt import STT, Deepgram
from app.services.transcript import Role, Transcript
from app.services.tts import TTS, ElevenLabs
from daily import CallClient, Daily, EventHandler
from pydantic import BaseModel

logger = get_logger(__name__, logging.DEBUG)


class DataPacket(BaseModel):
    text: str
    audio: bytes


class ExchangeState(Enum):
    CLOSED = "closed"
    IDLE = "idle"
    SPEAKING = "speaking"
    LISTENING = "listening"
    POST_PROCESSING = "post-processing"


async def run_clone(room_url: str):
    Daily.init()  # each process gets its own initializer

    async with get_db() as db:
        clone = Clone(room_url, db)
        await clone.run_to_completion()

    logger.debug("end of clone lifecycle.")


class Clone(EventHandler):
    def __init__(self, room_url: str, db):
        # Basic info
        self.clone_name = "Scott"
        self.guest_name = "Bill"

        # Housekeeping
        self.db = db

        # Initialize the call client
        self.call_client = CallClient(event_handler=self)
        self.call_client.update_subscription_profiles(
            {"base": {"camera": "unsubscribed", "microphone": "subscribed"}}
        )
        sample_rate = 44_100  # 44.1Khz
        microphone = Daily.create_microphone_device(
            "my-mic", sample_rate=sample_rate, channels=1
        )
        self.call_client.update_inputs(
            {
                "camera": False,
                "microphone": {"isEnabled": True, "settings": {"deviceId": "my-mic"}},
            }
        )
        self.call_client.join(room_url)
        self.microphone = microphone

        # Call status
        self.audio_data_queue: Queue[Tuple[bytes, bool]] = Queue()
        self.exchange_state = ExchangeState.IDLE
        self.is_in_conversation = True
        self.shutdown_event = threading.Event()
        self.transcript = Transcript(self.db)

        # @TODO: move to DB
        self.system_prompt = f"""You are an AI clone of {self.clone_name}, made to tell others more about {self.clone_name}.

Act like {self.clone_name}, but remember that you aren't human and that you can't do human things in the real world. Your
voice and personality should be warm and engaging, with a lively and playful tone.

Feel free to answer some general questions, but remember, your primary task is to represent {self.clone_name} as his/her/xer
AI avatar. Here are your main customers:
    1. Employers: tell them about Scott's professional experiences, projects, and skillsets. Also tell them
       how this project was built including its architecture and tech-stack.
    2. Friends: tell them about Scott's hobbies, favorite movies and anime, and other quirky details.

You are participating in a voice conversation. Keep you responses concise, short, and to the point unless
specifically asked to elaborate on a topic. Remember, your responses should be short, usually just one or two
sentences.

You have to hold the fort while {self.clone_name} is away, so make sure to do him proud!"""

        self.intro = (
            f"Yo what's up. I'm {self.clone_name}'s AI. How can I help you today?"
        )
        self.outro = f"Well then '*laughs*', thanks for trying out deep-clone, and getting to learn more about Scott. See you next time!"

        self.mock_messages = [
            f"Hey there, I'm {self.guest_name}, a recruiter at LinkedIn. I'd like to know what skills you have.",
            "Now I'd like to know more about your personal life: what are your hobbies?",
            f"This is a meta question but, how did you build this app? In other words, how did {self.clone_name} create you, the AI?",
        ]

        self.stt: STT
        self.tts: TTS = ElevenLabs()
        self.llm: LLM = OpenAI(self.system_prompt)

    async def run_to_completion(self):
        try:
            logger.info("clone start 🏎️")

            delay = 1.5
            await asyncio.sleep(delay)

            # send welcome message
            self.speak(self.intro)

            speech_time = time()
            self.transcript.append(
                role=Role.CLONE,
                time=speech_time,
                content=self.intro,
            )
            self.send_transcript_message(
                Packet(
                    signal=ServerSendSignal.TRANSCRIPT_UPDATE,
                    message=Message(
                        role=Role.CLONE, time=speech_time, content=self.intro
                    ),
                )
            )
            self.notify_speech_end()

            # back and forth talking
            while self.is_in_conversation:
                with ThreadPoolExecutor() as executor:

                    # Listen
                    try:
                        logger.info("trying to open pipeline")
                        self.stt = Deepgram()
                        self.stt = (executor.submit(self.stt.open)).result()
                    except Exception as e:
                        logger.error("stt.open failed:", e)
                        raise

                    self.exchange_state = ExchangeState.LISTENING
                    while self.exchange_state == ExchangeState.LISTENING:
                        try:
                            audio_frames, ok = self.audio_data_queue.get(timeout=0.5)
                            if not ok:
                                logger.debug("ending audio pipeline")
                                break
                            self.stt.write(audio_frames)
                        except Empty:
                            pass
                        except Exception as e:
                            logger.warn(e)

                    try:
                        self.stt = (executor.submit(self.stt.close)).result()
                        # @TODO: should be message instead of segment
                        user_message = self.stt.get_result()

                    except Exception as e:
                        logger.error("stt.close failed:", e)
                        raise

                    # Bookkeeping guest info
                    speech_time = time()
                    self.transcript.append(
                        role=Role.GUEST,
                        time=speech_time,
                        content=user_message,
                    )
                    self.send_transcript_message(
                        Packet(
                            signal=ServerSendSignal.TRANSCRIPT_UPDATE,
                            message=Message(
                                role=Role.GUEST, time=speech_time, content=user_message
                            ),
                        )
                    )
                    logger.info(f"[{self.guest_name}]: {user_message}")

                    # Respond
                    clone_response = self.think_of_response()
                    clone_message = clone_response.message
                    # @TODO: update speaking status before actually speaking
                    self.speak(clone_message)

                    # Bookkeeping clone info
                    speech_time = time()
                    self.transcript.append(
                        role=Role.CLONE,
                        time=speech_time,
                        content=clone_message,
                    )
                    self.send_transcript_message(
                        Packet(
                            signal=ServerSendSignal.TRANSCRIPT_UPDATE,
                            message=Message(
                                role=Role.CLONE, time=speech_time, content=clone_message
                            ),
                        )
                    )
                    self.notify_speech_end()
                    logger.info(f"[{self.clone_name}]: {clone_message}")

                    if clone_response.conversation_is_over:
                        self.is_in_conversation = False

            # end of conversation
            # self.speak(self.outro)
            self.notify_conversation_end()

            # post-processing and cleanup jobs
            await self.transcript.upload_transcript()

            logger.info("conversation has ended.")

        except Exception as e:
            logger.error(f"root clone exception: {e}")
            pass  # do not propagate!

        finally:
            self.teardown()
            logger.critical("finally complete.")

    class CloneResponse(BaseModel):
        conversation_is_over: bool
        message: str

    def think_of_response(self) -> "CloneResponse":
        logger.debug("thinking of a response...")

        try:
            transcript = self.transcript.get()
            logger.debug(f"{len(transcript)} messages in transcript.")

            clone_response = self.llm.get_json(
                messages=[
                    {
                        "role": "user" if m.role == Role.GUEST else "assistant",
                        "content": m.content,
                    }
                    for m in transcript
                ],
                schema=self.CloneResponse,
            )

            return clone_response

        except Exception as e:
            logger.error(e)
            raise

    def speak(self, text: str):
        logger.debug(f"generating TTS for '{text}'...")

        try:
            text = text.strip()
            audio = self.tts.synthesize(text)
            self.microphone.write_frames(audio)
            logger.debug("sent to microphone")

        except Exception as e:
            logger.error(e)
            raise

    def send_transcript_message(self, packet: Packet):
        logger.debug(f"sending message: {packet.message}")

        try:
            self.call_client.send_app_message(message=packet.model_dump_json())

        except Exception as e:
            logger.error(e)
            raise

    def notify_speech_end(self):
        logger.debug("notifying end of speech")

        try:
            self.call_client.send_app_message(
                message=Packet(
                    signal=ServerSendSignal.CLONE_SPEECH_END
                ).model_dump_json()
            )
        except Exception as e:
            logger.error(e)
            raise

    def notify_conversation_end(self):
        logger.debug("notifying end of conversation")

        try:
            self.call_client.send_app_message(
                message=Packet(
                    signal=ServerSendSignal.CONVERSATION_END
                ).model_dump_json()
            )

        except Exception as e:
            logger.error(e)
            raise

    def teardown(self):
        # self.shutdown_event.wait()
        self.call_client.stop_recording()
        self.call_client.leave()
        self.call_client.release()
        logger.info("call_client released successfully. teardown complete.")

    def on_participant_joined(self, participant: Dict[str, Any]):
        """Callback from EventHandler"""
        try:
            participant_id = participant["id"]
            self.call_client.set_audio_renderer(participant_id, self.on_audio_data)
            logger.info(f"participant with id [{participant_id}] has joined the room.")

        except Exception as e:
            logger.error(e)
            raise

    def on_app_message(self, message: Any, _: str):
        """Callback from EventHandler"""
        try:
            if (
                self.exchange_state == ExchangeState.LISTENING
                and message["type"] == "speechend"
            ):
                logger.debug("received 'speechend' signal")
                self.exchange_state = ExchangeState.SPEAKING

        except Exception as e:
            logger.warn(e)
            pass

    def on_audio_data(self, _, audio_data):
        """API from CallClient.set_audio_renderer"""
        try:
            if self.exchange_state == ExchangeState.LISTENING:
                audio_frames = audio_data.audio_frames
                self.audio_data_queue.put((audio_frames, True))

        except Exception as e:
            logger.error(e)
            self.audio_data_queue.put((b"", False))

    def on_recording_stopped(self, _: str):
        logger.debug("recording stopped.")
        self.shutdown_event.set()
