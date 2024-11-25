"use client";

import { DailyProvider, useCallObject } from "@daily-co/daily-react";
import { useState } from "react";

import { RoomStatusProvider } from "./providers/room-status-provider";
import { DailyRoom } from "./room";

export function DailyRoomWithProviders() {
  const callObject = useCallObject({});
  const [roomUrl, setRoomUrl] = useState("");

  return (
    <DailyProvider callObject={callObject} url={roomUrl}>
      <RoomStatusProvider>
        <DailyRoom callObject={callObject} setRoomUrl={setRoomUrl} />
      </RoomStatusProvider>
    </DailyProvider>
  );
}
