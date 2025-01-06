"use client";

import { DailyProvider, useCallObject } from "@daily-co/daily-react";
import { useState } from "react";

import { RoomStatusProvider } from "./providers/room-status-provider";
import { DailyRoom } from "./room";

export function DailyRoomWithProviders({ roomId }: { roomId: string }) {
  const callObject = useCallObject({
    options: {
      showLocalVideo: false,
    },
  });
  const [roomUrl, setRoomUrl] = useState("");

  return (
    <DailyProvider callObject={callObject} url={roomUrl}>
      <RoomStatusProvider>
        <DailyRoom
          roomId={roomId}
          callObject={callObject}
          setRoomUrl={setRoomUrl}
        />
      </RoomStatusProvider>
    </DailyProvider>
  );
}
