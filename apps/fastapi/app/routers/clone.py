import logging

from aiomultiprocess import Pool
from app.lib.logger import get_logger
from app.services.clone import run_clone
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request

router = APIRouter()

logger = get_logger(__name__, logging.DEBUG)


@router.post("/")
async def dial_clone(req: Request, bg_tasks: BackgroundTasks):
    logger.info("/clone endpoint hit")

    data = await req.json()
    room_url = data.get("room_url")
    # user_alias = data.get("user_alias")
    user_alias = "scottsus"

    # async with Pool() as pool:
    #     await pool.map(run_clone, [(room_url, user_alias)])
    async def multiprocess_runner():
        async with Pool() as pool:
            await pool.map(run_clone, [(room_url, user_alias)])

    bg_tasks.add_task(multiprocess_runner)

    return {"message": "dial_clone success"}
