"use client";

import { DailyProvider, useCallObject } from "@daily-co/daily-react";
import { useEffect, useState } from "react";

import { createRoom, dialClone } from "./api";
import { Audio } from "./audio";
import { EndResponseButton } from "./components/end-response";
import { RoomStatusProvider } from "./providers/room-status-provider";
import { Transcript } from "./transcript";
import { Video } from "./video";

const IS_TEST_MODE = false;

export function DailyRoom() {
  const [roomUrl, setRoomUrl] = useState("");

  const callObject = useCallObject({});

  useEffect(() => {
    if (!callObject) {
      console.log("Empty callObject");
      return;
    }

    if (!IS_TEST_MODE) {
      callObject
        .startCamera()
        .then(() => createRoom())
        .then(({ url }) => {
          console.log("Joining", url);

          callObject.join({ url: url });
          setRoomUrl(url);

          console.log("Successfully set everything!");

          return url;
        })
        .then((url) => {
          dialClone({ roomUrl: url });
        });
    }
  }, [callObject]);

  return (
    <DailyProvider callObject={callObject} url={roomUrl}>
      <RoomStatusProvider>
        <div className="flex h-full flex-1 items-center justify-center gap-x-6">
          <div className="flex w-3/4 flex-col items-center gap-y-4">
            {!IS_TEST_MODE ? <Video /> : <h1>Video goes here</h1>}
            <Audio />
            <EndResponseButton />
          </div>
          <div className="flex h-full w-1/4 items-center">
            <Transcript />
          </div>
        </div>
      </RoomStatusProvider>
    </DailyProvider>
  );
}
