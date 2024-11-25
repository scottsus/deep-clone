"use client";

import { useAppMessage, useParticipantIds } from "@daily-co/daily-react";
import { SpaceIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  SpeakingExchangeState,
  useRoomStatus,
} from "../providers/room-status-provider";

export function EndResponseButton() {
  const [participantId] = useParticipantIds({ filter: "remote" });

  const { speakingExchangeState, setSpeakingExchangeState } = useRoomStatus();
  const [isDisabled, setIsDisabled] = useState(true);

  const sendAppMessage = useAppMessage();
  const sendSpeechEnd = useCallback(() => {
    sendAppMessage({ type: "speechend" });
  }, [participantId, sendAppMessage]);

  useEffect(() => {
    // just a small pause before
    const timeoutId = setTimeout(() => {
      setIsDisabled(false);
    }, 1500);

    const handleSpacebarClick = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isDisabled) {
        sendSpeechEnd();
        setSpeakingExchangeState(SpeakingExchangeState.CLONE_THINKING);
      }
    };
    document.addEventListener("keydown", handleSpacebarClick);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleSpacebarClick);
    };
  }, [speakingExchangeState, isDisabled, sendSpeechEnd]);

  return (
    <div
      className={`mx-auto mb-4 mt-auto flex cursor-pointer flex-row items-center space-x-2 rounded-xl bg-violet-400 px-4 py-2 transition-all hover:px-5 ${isDisabled ? "opacity-50" : "opacity-100"}`}
      onClick={() => {
        !isDisabled && sendSpeechEnd();
      }}
    >
      <p className="text-sm font-semibold text-white">End Response</p>
      <div className="rounded-lg bg-gray-100/30 px-2 py-0.5 text-white">
        <SpaceIcon />
      </div>
    </div>
  );
}
