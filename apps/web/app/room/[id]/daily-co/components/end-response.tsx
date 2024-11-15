"use client";

import { useAppMessage, useParticipantIds } from "@daily-co/daily-react";
import { SpaceIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export function EndResponseButton() {
  const [disabled, setDisabled] = useState(true);
  const [participantId] = useParticipantIds({ filter: "remote" });

  const sendAppMessage = useAppMessage();
  const sendSpeechEnd = useCallback(() => {
    sendAppMessage({ type: "speechend" });
    console.log("sent app message");
  }, [participantId, sendAppMessage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDisabled(false);
    }, 1500);

    const handleSpacebarClick = (event: KeyboardEvent) => {
      if (event.code === "Space" && !disabled) {
        sendSpeechEnd();
      }
    };

    document.addEventListener("keydown", handleSpacebarClick);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleSpacebarClick);
    };
  }, [disabled, sendSpeechEnd]);

  return (
    <div
      className={`mx-auto mb-4 mt-auto flex cursor-pointer flex-row space-x-2 rounded-xl px-4 py-2 duration-300 hover:px-5 max-md:hidden ${
        disabled ? "bg-[#6484FF] opacity-50" : "bg-[#6484FF]"
      }`}
      onClick={() => {
        !disabled && sendSpeechEnd();
      }}
    >
      <p className="text-sm font-semibold text-white">End Response</p>
      <div className="rounded-lg bg-gray-100/30 px-2 py-0.5 text-white">
        <SpaceIcon />
      </div>
    </div>
  );
}
