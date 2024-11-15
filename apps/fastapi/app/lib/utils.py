import io

from pydub import AudioSegment


def audio_bytes_to_pcm_frames(audio_bytes: bytes):
    """Converts audio bytes to PCM frames"""

    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    pcm_frames = audio_segment.raw_data  # 16-bit PCM frames

    return pcm_frames
