import logging
from typing import List

from app.lib.logger import get_logger
from app.lib.types.message import Message, Role

logger = get_logger(__name__, logging.DEBUG)


class Message:
    def __init__(self, role: Role, time: float, content: str):
        self.role = role
        self.time = time
        self.content = content

    def __repr__(self):
        return f"[{self.time}]:[{self.role}] -- {self.content}"


class Transcript:
    def __init__(self, db):
        self.room_id: str
        self.messages: List[Message] = []
        self.db = db

    def get(self) -> List[Message]:
        return self.messages

    async def get_from_db(self):
        try:
            messages = await self.db.message.find_many(
                where={"conversationId": self.conversationId}
            )
            return messages

        except Exception as e:
            logger.error(f"unable to get messages in conversation: {e}")

    def append(self, role: Role, time: float, content: str):
        message = Message(role=role, time=time, content=content)
        self.messages.append(message)

    async def upload_transcript(self, message: Message):
        pass
        # @TODO: upload transcript
        # logger.info("uploading transcript...")
        # try:
        #     new_message = await self.db.message.create(
        #         data={
        #             "conversationId": self.room_id,
        #             "role": message.role.value,
        #             "startTime": message.time,
        #             "content": message.content,
        #         }
        #     )
        #     logger.info("transcript successfully uploaded")

        #     return new_message

        # except Exception as e:
        #     logger.warn(f"did not save {message}: {e}")
