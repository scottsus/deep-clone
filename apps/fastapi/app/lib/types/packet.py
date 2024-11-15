from enum import Enum
from typing import Union

from app.lib.types.message import Message
from pydantic import BaseModel

"""Packets and signals sent & received to/from client-side to keep track of room status"""


class ClientSendSignal(Enum):
    pass


class ServerSendSignal(Enum):
    TRANSCRIPT_UPDATE = "transcript_update"


class Packet(BaseModel):
    signal: Union[ClientSendSignal, ServerSendSignal]
    message: Message
