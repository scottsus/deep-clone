"use client";

import { useDevices } from "@daily-co/daily-react";
import { useMicVAD } from "@ricky0123/vad-react";
import { useEffect, useState } from "react";

export function Audio() {
  const { currentMic } = useDevices();
  const vad = useMicVAD({
    model: "v5",
    onSpeechEnd: (audio) => {
      console.log("speech end");
    },
    additionalAudioConstraints: {
      deviceId: currentMic?.device.deviceId,
    },
    positiveSpeechThreshold: 0.6,
    negativeSpeechThreshold: 0.25,
  });

  useEffect(() => {
    if (!currentMic?.device.deviceId) {
      return;
    }
  }, [currentMic]);

  return (
    <div>
      <h1>hello from audio</h1>
    </div>
  );
}
