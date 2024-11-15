from contextlib import asynccontextmanager

from fastapi import FastAPI
from prisma import Prisma

db = Prisma()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Recommended: this is the standard way to use a db instance ✅"""
    await db.connect()
    yield
    await db.disconnect()


@asynccontextmanager
async def get_db():
    """Unsafe: if a child process requires a db instance, you may need a seperate connection.
    In this case, concurrent writes are a potential danger and should be used with caution 🚸
    """
    db_instance = Prisma()
    await db_instance.connect()
    try:
        yield db_instance
    finally:
        await db_instance.disconnect()
