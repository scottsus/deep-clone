from uuid import UUID

from app.db import db
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/")
async def get_users():
    users = await db.user.find_many()
    return users


@router.get("/{user_id}")
async def get_user(user_id: UUID):
    user = await db.user.find_unique(where={"id": user_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")


@router.post("/")
async def create_user(user_data):
    try:
        new_user = await db.user.create(data=user_data.dict())
        return new_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}")
async def update_user(user_id: UUID, user_data):
    try:
        updated_user = await db.user.update(
            where={"id": user_id}, data=user_data.dict(exclude_unset=True)
        )
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: UUID):
    try:
        await db.user.delete(where={"id": user_id})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
