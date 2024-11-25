"use server";

import { db } from "@repo/db";

export async function createRoomInDb({
  userAlias,
  guestName,
}: {
  userAlias: string;
  guestName: string;
}) {
  try {
    const room = await db.room.create({
      data: {
        userAlias,
        guestName,
      },
    });

    return room.id;
  } catch (err) {
    console.error("createRoomInDb:", err);
  }
}
