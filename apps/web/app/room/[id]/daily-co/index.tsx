"use client";

import { DailyProvider, useCallObject } from "@daily-co/daily-react";
import { useEffect, useState } from "react";

import { createRoom, dialClone } from "./api";
import { Audio } from "./audio";
import { EndResponseButton } from "./components/end-response";
import { RoomStatusProvider } from "./providers/room-status-provider";
import { Transcript } from "./transcript";
import { Video } from "./video";

export function DailyRoom({
  videoEnabled = false,
}: {
  videoEnabled?: boolean;
}) {
  const [roomUrl, setRoomUrl] = useState("");
  const callObject = useCallObject({});

  useEffect(() => {
    if (!callObject) {
      return;
    }

    // callObject.startCamera().then()...
    createRoom()
      .then(({ url }) => {
        callObject.join({ url: url });
        setRoomUrl(url);

        return url;
      })
      .then((url) => {
        dialClone({ roomUrl: url });
      });
  }, [callObject]);

  return (
    <DailyProvider callObject={callObject} url={roomUrl}>
      <RoomStatusProvider>
        <div className="flex h-full w-4/5 flex-1 flex-col items-center justify-around">
          <div className="flex w-full flex-col items-center gap-y-8">
            {videoEnabled && <Video />}
            <Audio />
            <EndResponseButton />
          </div>
          <div className="flex h-3/4 w-full items-center">
            <Transcript />
          </div>
        </div>
      </RoomStatusProvider>
    </DailyProvider>
  );
}
