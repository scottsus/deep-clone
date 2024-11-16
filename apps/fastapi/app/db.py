from prisma import Prisma
from contextlib import asynccontextmanager
from fastapi import FastAPI

db = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()

    yield

    await db.disconnect()
