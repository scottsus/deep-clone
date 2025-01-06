"use server";

import { Prisma } from "@prisma/client";
import { db } from "@repo/db";

export async function getClone({ userAlias }: { userAlias: string }) {
  try {
    const clone = await db.clone.findFirst({
      where: {
        userAlias: userAlias,
      },
    });

    return clone;
  } catch (err) {
    throw new Error("unable to find existing clone");
  }
}

export async function createRoomInDb({
  userAlias,
  guest,
}: {
  userAlias: string;
  guest: Prisma.GuestCreateInput;
}) {
  try {
    const clone = await getClone({ userAlias });
    if (!clone?.id) {
      throw new Error("error getting clone while creating room");
    }

    let guestId = "";
    const foundGuest = await db.guest.findFirst({
      where: {
        AND: [{ firstName: guest.firstName }, { lastName: guest.lastName }],
      },
      select: {
        id: true,
      },
    });
    if (foundGuest) {
      guestId = foundGuest.id;
    } else {
      if (!foundGuest) {
        const newGuest = await db.guest.create({
          data: {
            firstName: guest.firstName,
            lastName: guest.lastName,
          },
          select: {
            id: true,
          },
        });
        guestId = newGuest.id;
      }
    }
    if (!guestId) {
      throw new Error("unable to find or create new guest");
    }

    const room = await db.room.create({
      data: {
        cloneId: clone?.id,
        guestId: guestId,
      },
      select: {
        id: true,
      },
    });
    if (!room?.id) {
      throw new Error("unable to create new room in db");
    }

    return room.id;
  } catch (err) {
    console.error("createRoomInDb:", err);
  }
}

export async function addUrlToRoomInDb({
  roomId,
  url,
}: {
  roomId: string;
  url: string;
}) {
  try {
    const room = await db.room.update({
      data: {
        url,
      },
      where: {
        id: roomId,
      },
    });

    return room;
  } catch (err) {
    console.error("addUrlToRoomInDb:", err);
  }
}
