import logging
import os
from abc import ABC, abstractmethod
from queue import Queue
from threading import Event, Lock, Thread

from app.lib.logger import get_logger
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveClient,
    LiveOptions,
    LiveResultResponse,
    LiveTranscriptionEvents,
)

logger = get_logger(__name__, logging.DEBUG)


class STT(ABC):
    """Every Speech-To-Text (STT) model must be able to do the following"""

    @abstractmethod
    def construct(self) -> "STT":
        """Constructs a singleton instance of an STT model"""
        pass

    @abstractmethod
    def open(self) -> "STT":
        """Opens a websocket connection and starts listening"""
        pass

    @abstractmethod
    def write(self):
        """Writes audio data in bytes to the pipeline to be fed into Deepgram API"""
        pass

    @abstractmethod
    def close(self) -> "STT":
        """Closes the websocket connection"""
        pass

    @abstractmethod
    def get_result(self) -> str:
        """Returns the final segment of the conversation"""
        pass


class Deepgram(STT):
    def __init__(self):
        self._api_key = os.getenv("DEEPGRAM_API_KEY")

        self._live_options = LiveOptions(
            model="nova-2",
            language="en",
            channels=1,
            punctuate=True,
            smart_format=True,
            encoding="linear16",
            sample_rate=48_000,
        )
        self._client_options = DeepgramClientOptions({"keepalive": "true"})
        self._client = DeepgramClient(self._api_key, self._client_options)
        self._socket: LiveClient = self._client.listen.live.v("1")

        self._socket.on(LiveTranscriptionEvents.Open, self._on_open)
        self._socket.on(LiveTranscriptionEvents.Close, self._on_close)
        self._socket.on(LiveTranscriptionEvents.Error, self._on_error)
        self._socket.on(LiveTranscriptionEvents.Transcript, self._on_chunk_receive)

        self._start = self._socket.start
        self._write = self._socket.send
        self._finish = self._socket.finish

        self.segment = ""
        self.result = ""
        self.chunks_queue = Queue()
        self.mu = Lock()
        self.speech_done = Event()

    def construct(self) -> "Deepgram":
        return Deepgram()

    def open(self) -> "Deepgram":
        self._start(self._live_options)
        self._segment_builder_thread = Thread(target=self._segment_builder)
        self._segment_builder_thread.start()

        logger.info(f"opened Deepgram pipeline")
        return self

    def write(self, audio_data: bytes):
        self._write(audio_data)

    def close(self) -> "Deepgram":
        """Cleans up resources and returns the final segment"""
        # wait for completion of speech input
        self.speech_done.wait(timeout=0.3)

        self._finish()
        self.chunks_queue.join()
        self.chunks_queue.put(None)  # break the loop
        self._segment_builder_thread.join()

        self.result = self.segment
        self.segment = ""
        logger.info("closed Deepgram pipeline")
        return self

    def get_result(self):
        return self.result

    def _on_chunk_receive(self, *args, **kwargs):
        try:
            result: LiveResultResponse = kwargs["result"]
            chunk: str = result.channel.alternatives[0].transcript
            if result.is_final:
                self.chunks_queue.put(chunk)

            with self.mu:
                if result.speech_final:
                    self.speech_done.set()
                else:
                    self.speech_done.clear()

        except Exception as e:
            logger.error(e)

    def _segment_builder(self):
        while True:
            try:
                chunk = self.chunks_queue.get()
                self.chunks_queue.task_done()
                if chunk is None:
                    logger.debug("_segment_builder exited gracefully.")
                    break

                self.segment += chunk + " "

            except Exception as e:
                logger.error(e)
                break

    def _on_open(self, *args, **kwargs):
        logger.debug("Deepgram._on_open")

    def _on_close(self, *args, **kwargs):
        logger.debug("Deepgram._on_close")

    def _on_error(self, *args, **kwargs):
        logger.error("Deepgram._on_error:", args[0])
