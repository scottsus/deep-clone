from enum import Enum

from pydantic import BaseModel


class Role(Enum):
    GUEST = "GUEST"
    CLONE = "CLONE"


class Message(BaseModel):
    role: Role
    time: float
    content: str

    def __repr__(self):
        return f"[{self.time}]:[{self.role}] -- {self.content}"
