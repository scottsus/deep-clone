import { Role } from "@prisma/client";
import { Message } from "~/lib/types/message";
import { useRef } from "react";

import { useRoomStatus } from "./providers/room-status-provider";

export function Transcript() {
  const { transcript } = useRoomStatus();
  const guestName = "Scott";
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex size-full flex-col gap-y-4 rounded-lg bg-gray-100 p-4">
      <h1 className="my-2 w-full text-center text-lg font-semibold">
        Transcript
      </h1>
      <div className="border border-gray-300" />
      <div className="flex size-full flex-col gap-y-3 overflow-y-scroll p-2">
        {transcript.map((m: Message, idx: number) => {
          return (
            <div className="flex w-full select-none flex-col" key={idx}>
              {m.role === Role.GUEST ? (
                <p className="font-base ml-auto text-sm">{guestName}</p>
              ) : (
                <p className="font-base text-sm">Scott's AI</p>
              )}
              <div className="flex w-full flex-row">
                <div
                  className={`flex max-w-52 flex-row ${
                    m.role === Role.CLONE ? "mr-auto" : "ml-auto mr-0"
                  }`}
                >
                  <div
                    className={`w-full rounded-xl border-0 border-none p-3 ${
                      m.role === Role.CLONE
                        ? "rounded-tl-none bg-slate-200"
                        : "rounded-tr-none bg-[#6484FF]"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        m.role === Role.GUEST && "text-white"
                      }`}
                    >
                      {m.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={endOfMessagesRef} />
    </div>
  );
}
