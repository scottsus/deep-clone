import asyncio
import logging
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
from queue import Empty, Queue
from time import time
from typing import Any, Dict, List, Tuple

import requests
from app.db import get_db
from app.lib.ai import LLM, Anthropic, OpenAI
from app.lib.logger import get_logger
from app.lib.types.message import Message
from app.lib.types.packet import ClientSendSignal, Packet, ServerSendSignal
from app.services.prompt import (
    construct_error,
    construct_intro,
    construct_outro,
    construct_system_prompt,
)
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
        guest_name = "Unknown"
        try:
            room = await db.room.find_first(
                where={"url": room_url}, include={"guest": True}
            )
            guest_name = f"{room.guest.firstName} {room.guest.lastName}"
        except Exception as e:
            logger.warn("unable to retrieve guest name")

        clone = Clone(room_url, guest_name, db)
        await clone.run_to_completion()

    logger.debug("end of clone lifecycle.")


class Clone(EventHandler):
    def __init__(self, room_url: str, guest_name: str, db):
        # Basic info
        self.clone_name = "Scott"
        self.guest_name = guest_name

        # Housekeeping
        self.db = db
        self.room_url = room_url

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
        self.guest_joined_event = threading.Event()
        self.audio_data_queue: Queue[Tuple[bytes, bool]] = Queue()
        self.exchange_state = ExchangeState.IDLE
        self.is_in_conversation = True
        self.shutdown_event = threading.Event()
        self.transcript = Transcript(self.db)

        self.system_prompt = construct_system_prompt(self.clone_name)
        self.intro = construct_intro(self.clone_name)
        self.outro = construct_outro(self.clone_name)
        self.error = construct_error()

        self.stt: STT
        self.tts: TTS = ElevenLabs()
        self.llm: LLM = OpenAI(self.system_prompt)

    async def run_to_completion(self):
        try:
            logger.info("waiting for guest to join successfully...")
            timeout_duration = 30.0
            guest_joined_successfully = self.guest_joined_event.wait(timeout_duration)
            if not guest_joined_successfully:
                logger.error("guest failed to join")
                return

            # guest has joined!
            logger.info("clone start 🏎️")

            delay = 1.5
            await asyncio.sleep(delay)

            # send welcome message
            self.update_transcript_and_speak(self.intro)

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
                            break

                    try:
                        self.stt = (executor.submit(self.stt.close)).result()
                        user_message = self.stt.get_result()
                        if not user_message:
                            user_message = "<silence>"

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
                    self._send_transcript_message(
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
                    for clone_message in clone_response.messages:
                        self.update_transcript_and_speak(clone_message)
                        logger.info(f"[{self.clone_name}]: {clone_message}")

                    if clone_response.conversation_is_over:
                        self.is_in_conversation = False

            # end of conversation
            self.update_transcript_and_speak(self.outro)
            self.notify_conversation_end()

            # post-processing and cleanup jobs
            # TODO: upload transcript
            # await self.transcript.upload_transcript()
            self.send_success_email_notification()

            logger.info("conversation has ended.")

        except Exception as e:
            logger.error(f"root clone exception: {e}")
            self.update_transcript_and_speak(self.error)
            pass  # do not propagate!

        finally:
            self.teardown()
            logger.critical("finally complete.")

    class CloneResponse(BaseModel):
        conversation_is_over: bool
        messages: List[str]

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

    def update_transcript_and_speak(self, text: str):
        speech_time = time()
        self.transcript.append(role=Role.CLONE, time=speech_time, content=text)
        self._send_transcript_message(
            Packet(
                signal=ServerSendSignal.TRANSCRIPT_UPDATE,
                message=Message(role=Role.CLONE, time=speech_time, content=text),
            )
        )
        self._speak(text)
        self._notify_speech_end()

    def _speak(self, text: str):
        logger.debug(f"generating TTS for '{text}'...")

        try:
            text = text.strip()
            audio = self.tts.synthesize(text)
            self.microphone.write_frames(audio)
            logger.debug("sent to microphone")

        except Exception as e:
            logger.error(e)
            raise

    def send_handshake_ack(self):
        logger.debug("completing handshake")

        try:
            self.call_client.send_app_message(
                message=Packet(
                    signal=ServerSendSignal.GUEST_JOINED_SUCCESS_ACK
                ).model_dump_json()
            )

        except Exception as e:
            logger.error(e)
            raise

    def _send_transcript_message(self, packet: Packet):
        logger.debug(f"sending message: {packet.message}")

        try:
            self.call_client.send_app_message(message=packet.model_dump_json())

        except Exception as e:
            logger.error(e)
            raise

    def _notify_speech_end(self):
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

    def send_success_email_notification(self):
        try:
            email_server_url = os.getenv("EMAIL_SERVER_URL")
            res = requests.post(
                f"{email_server_url}/api/notifications/email",
                json={"guestName": self.guest_name, "roomUrl": self.room_url},
            )
            res.raise_for_status()
            logger.info("sent success notification email")

        except requests.exceptions.RequestException as e:
            logger.error(f"failed to send email notification")

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
            self.guest_joined_event.set()
            self.call_client.set_audio_renderer(participant_id, self.on_audio_data)
            logger.info(f"guest with id [{participant_id}] has joined the room.")

        except Exception as e:
            logger.error(e)
            raise

    def on_app_message(self, message: Any, _: str):
        """Callback from EventHandler"""
        try:
            if message["signal"] == ClientSendSignal.GUEST_SPEECH_END.name:
                if self.exchange_state == ExchangeState.LISTENING:
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
