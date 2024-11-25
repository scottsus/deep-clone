import {
  DailyAudio,
  useAudioTrack,
  useLocalSessionId,
} from "@daily-co/daily-react";
import { MicrophoneFrequency } from "~/app/[userAlias]/components/mic-test";

export function Audio() {
  const localSessionId = useLocalSessionId();
  const audioTrack = useAudioTrack(localSessionId);

  return (
    <div>
      <MicrophoneFrequency audioTrack={audioTrack} />
      <DailyAudio />
    </div>
  );
}
