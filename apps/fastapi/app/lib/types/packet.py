from enum import Enum
from typing import Optional, Union

from app.lib.types.message import Message
from pydantic import BaseModel

"""Packets and signals sent & received to/from client-side to keep track of room status"""


class ClientSendSignal(Enum):
    GUEST_JOINED_SUCCESS = "GUEST_JOINED_SUCCESS"
    GUEST_SPEECH_END = "GUEST_SPEECH_END"


class ServerSendSignal(Enum):
    GUEST_JOINED_SUCCESS_ACK = "GUEST_JOINED_SUCCESS_ACK"
    TRANSCRIPT_UPDATE = "TRANSCRIPT_UPDATE"
    CLONE_SPEECH_END = "CLONE_SPEECH_END"
    CONVERSATION_END = "CONVERSATION_END"


class Packet(BaseModel):
    signal: Union[ClientSendSignal, ServerSendSignal]
    message: Optional[Message] = None
