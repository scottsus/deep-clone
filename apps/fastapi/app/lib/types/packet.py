from enum import Enum
from typing import Optional, Union

from app.lib.types.message import Message
from pydantic import BaseModel

"""Packets and signals sent & received to/from client-side to keep track of room status"""


class ClientSendSignal(Enum):
    pass


class ServerSendSignal(Enum):
    TRANSCRIPT_UPDATE = "transcript_update"
    CLONE_SPEECH_END = "clone_speech_end"
    CONVERSATION_END = "conversation_end"


class Packet(BaseModel):
    signal: Union[ClientSendSignal, ServerSendSignal]
    message: Optional[Message] = None
