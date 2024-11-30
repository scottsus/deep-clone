import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";

import {
  SpeakingExchangeState,
  useRoomStatus,
} from "../../providers/room-status-provider";
import styles from "./avatar.module.css";

export function Avatar() {
  const { speakingExchangeState } = useRoomStatus();

  return (
    <div className="flex size-full items-center justify-center">
      <div
        className={cn(
          speakingExchangeState === SpeakingExchangeState.CLONE_SPEAKING
            ? styles.avatarSpeaking
            : styles.avatarListening,
        )}
      >
        <Image
          alt="Scott's Avatar"
          src="/images/scott-avatar.jpeg"
          className="rounded-md"
          width={250}
          height={100}
        />
      </div>
    </div>
  );
}
