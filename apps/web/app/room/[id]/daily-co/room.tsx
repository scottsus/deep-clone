import { DailyCall } from "@daily-co/daily-js";
import { ClientSendSignal, Packet } from "~/lib/types/packet";
import { sleep } from "~/lib/utils";
import { useEffect } from "react";

import { createRoom, dialClone } from "./api";
import { Audio } from "./audio";
import { EndResponseButton } from "./components/end-response";
import { useRoomStatus } from "./providers/room-status-provider";
import { Transcript } from "./transcript";
import { Video } from "./video";

export function DailyRoom({
  callObject,
  setRoomUrl,
  videoEnabled = false,
}: {
  callObject: DailyCall | null;
  setRoomUrl: (url: string) => void;
  videoEnabled?: boolean;
}) {
  const { sendAppMessage } = useRoomStatus();

  useEffect(() => {
    if (!callObject) {
      return;
    }

    // callObject.startCamera().then()...
    createRoom()
      .then(async ({ url }) => {
        await callObject.join({ url: url });
        setRoomUrl(url);

        return url;
      })
      .then((url) => {
        dialClone({ roomUrl: url });
      })
      .then(async () => {
        const delay = 2000;
        await sleep(delay);
        const packet: Packet = {
          signal: ClientSendSignal.GUEST_JOINED_SUCCESS,
        };
        sendAppMessage(packet);
      });
  }, [callObject]);

  return (
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
  );
}
