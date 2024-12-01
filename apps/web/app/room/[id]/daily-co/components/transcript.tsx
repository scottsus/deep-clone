import { Role } from "@prisma/client";
import { Message } from "~/lib/types/message";

import { useRoomStatus } from "../providers/room-status-provider";

export function Transcript() {
  const { transcript } = useRoomStatus();
  const guestName = "Bill";

  return (
    <div className="flex size-full flex-col gap-y-3 overflow-y-scroll p-4">
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
  );
}
