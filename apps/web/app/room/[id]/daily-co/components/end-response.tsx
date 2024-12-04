"use client";

import { useAppMessage } from "@daily-co/daily-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useMicVAD } from "@ricky0123/vad-react";
import { ClientSendSignal, Packet } from "~/lib/types/packet";
import { SendIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  SpeakingExchangeState,
  useRoomStatus,
} from "../providers/room-status-provider";

export function EndResponseButton() {
  const { speakingExchangeState, setSpeakingExchangeState } = useRoomStatus();
  const [isDisabled, setIsDisabled] = useState(true);

  const _ = useMicVAD({
    model: "v5",
    onSpeechEnd: (_) => {
      console.log("speech end");
      sendSpeechEnd();
    },
  });

  const sendAppMessage = useAppMessage();
  const sendSpeechEnd = useCallback(() => {
    const packet: Packet = {
      signal: ClientSendSignal.GUEST_SPEECH_END,
    };
    sendAppMessage(packet);
  }, [sendAppMessage]);

  useEffect(() => {
    if (speakingExchangeState === SpeakingExchangeState.CONVERSATION_ENDED) {
      setIsDisabled(true);
      return;
    }

    if (speakingExchangeState !== SpeakingExchangeState.GUEST_SPEAKING) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }

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
    <Button
      className={cn(isDisabled ? "opacity-40" : "opacity-100")}
      onClick={() => {
        !isDisabled && sendSpeechEnd();
      }}
      disabled={isDisabled}
    >
      <SendIcon />
    </Button>
  );
}
