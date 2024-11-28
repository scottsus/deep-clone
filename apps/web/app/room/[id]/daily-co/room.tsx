import { DailyCall } from "@daily-co/daily-js";
import { Loader } from "@repo/ui/components/ui/";
import { ClientSendSignal, Packet } from "~/lib/types/packet";
import { sleep } from "~/lib/utils";
import { useCallback, useEffect } from "react";

import { createRoom, dialClone } from "./api";
import { Audio } from "./audio";
import { EndResponseButton } from "./components/end-response";
import { useRoomStatus } from "./providers/room-status-provider";
import { Transcript } from "./transcript";

export function DailyRoom({
  callObject,
  setRoomUrl,
}: {
  callObject: DailyCall | null;
  setRoomUrl: (url: string) => void;
}) {
  const { sendAppMessage, handshakeIsComplete } = useRoomStatus();
  const performHandshake = useCallback(async () => {
    const delay = 1000;
    const maxIterations = 30;
    for (let i = 0; i < maxIterations; i++) {
      if (handshakeIsComplete) {
        console.log("handshake complete");
        break;
      }
      const packet: Packet = {
        signal: ClientSendSignal.GUEST_JOINED_SUCCESS,
      };
      sendAppMessage(packet);
      await sleep(delay);
    }
  }, [sendAppMessage, handshakeIsComplete]);

  useEffect(() => {
    if (!callObject) {
      return;
    }

    createRoom()
      .then(async ({ url }) => {
        await callObject.join({ url: url, startVideoOff: true });
        setRoomUrl(url);

        return url;
      })
      .then((url) => {
        dialClone({ roomUrl: url });
      })
      .then(() => {
        performHandshake();
      });
  }, [callObject]);

  return (
    <div className="flex h-full w-4/5 flex-1 flex-col items-center justify-around">
      <Loader isLoading={!handshakeIsComplete} />
      <Audio /> {/** <Audio /> takes awhile to load, so render it first */}
      {handshakeIsComplete && (
        <>
          <div className="flex w-full flex-col items-center gap-y-8">
            <EndResponseButton />
          </div>
          <div className="flex h-3/4 w-full items-center">
            <Transcript />
          </div>
        </>
      )}
    </div>
  );
}
