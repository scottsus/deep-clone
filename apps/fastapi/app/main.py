from app.db import lifespan
from app.routers import clone, users
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

api_router = FastAPI(lifespan=lifespan)


@api_router.get("/")
async def healthcheck():
    return {"status": "ok"}


api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(clone.router, prefix="/clone", tags=["clone"])
