import logging
import os
from abc import ABC, abstractmethod

from app.lib.logger import get_logger
from app.lib.utils import audio_bytes_to_pcm_frames
from requests import request

logger = get_logger(__name__, logging.INFO)


class TTS(ABC):
    @abstractmethod
    def synthesize(self, text: str):
        """Converts text into 16-bit pcm audio"""
        pass


# https://github.com/scottsus
SCOTTSUS = "f78cCrsIlJSqpKC9Je98"


class ElevenLabs:
    def __init__(self, voice_id: str = SCOTTSUS):
        self.model = "eleven_turbo_v2"
        self.voice_id = voice_id

    def synthesize(self, text: str):
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
            headers = {
                "xi-api-key": os.getenv("ELEVENLABS_API_KEY"),
                "Content-Type": "application/json",
            }
            payload = {
                "text": text,
                "output_format": "mp3_22050_32",
                "model_id": self.model,
                "language": "en",
                "voice_settings": {
                    "stability": 0.35,
                    "similarity_boost": 0.95,
                    "style": 0.0,
                    "use_speaker_boost": True,
                },
            }
            res = request("POST", url, json=payload, headers=headers)
            if res.status_code != 200:
                raise Exception(res["detail"])

            audio_bytes = res.content
            logger.debug("ElevenLabs: generated audio bytes.")

            audio_pcm = audio_bytes_to_pcm_frames(audio_bytes)
            logger.info("generated audio_pcm")

            return audio_pcm

        except Exception as e:
            logger.error(e)
            raise
