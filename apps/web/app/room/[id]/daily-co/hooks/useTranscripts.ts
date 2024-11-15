"use client";

import { Message } from "~/lib/types/message";
import { useEffect, useRef, useState } from "react";

export function useTranscriptSync(
  videoRef: React.RefObject<HTMLVideoElement>,
  transcripts: Message[],
) {
  const [currentTime, setCurrentTime] = useState(0);
  const transcriptRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime * 1000);
    video.addEventListener("timeupdate", updateTime);
    return () => video.removeEventListener("timeupdate", updateTime);
  }, [videoRef]);

  useEffect(() => {
    if (!transcriptRef.current) return;

    const currentTranscript = transcripts.find((t, index) => {
      const nextTranscript = transcripts[index + 1];
      return (
        t.time <= currentTime &&
        (nextTranscript ? nextTranscript.time > currentTime : true)
      );
    });

    if (currentTranscript) {
      const element = transcriptRef.current.querySelector(
        `[data-start-time="${currentTranscript.time}"]`,
      );
      element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentTime, transcripts]);

  const isCurrentTranscript = (index: number) =>
    index ===
    transcripts.findIndex((t, i) => {
      const nextTranscript = transcripts[i + 1];
      return (
        t.time <= currentTime &&
        (nextTranscript ? nextTranscript.time > currentTime : true)
      );
    });

  return { transcriptRef, currentTime, isCurrentTranscript };
}
