import { useAudioTrack, useLocalSessionId } from "@daily-co/daily-react";
import { MicrophoneFrequency } from "~/app/[userAlias]/components/mic-frequency";

export function SoundWave() {
  const localSessionid = useLocalSessionId();
  const audioTrack = useAudioTrack(localSessionid);

  return <MicrophoneFrequency audioTrack={audioTrack} />;
}
