from app.db import db, lifespan
from app.routers import users
from fastapi import FastAPI

api_router = FastAPI(lifespan=lifespan)


@api_router.get("/")
async def healthcheck():
    return {"status": "ok"}


api_router.include_router(users.router, prefix="/users", tags=["users"])
