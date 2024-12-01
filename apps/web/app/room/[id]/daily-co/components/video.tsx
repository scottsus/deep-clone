"use client";

import { DailyVideo, useLocalSessionId } from "@daily-co/daily-react";

export function Video() {
  const localSessionId = useLocalSessionId();

  return (
    <div className="rounded-lg">
      <DailyVideo
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "20px",
        }}
        sessionId={localSessionId}
        automirror
        fit="cover"
        type={"video"}
      />
    </div>
  );
}
