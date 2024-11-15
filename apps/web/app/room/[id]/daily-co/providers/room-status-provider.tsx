import type { DailyEventObjectAppMessage } from "@daily-co/daily-js";
import { useAppMessage } from "@daily-co/daily-react";
import { Message } from "~/lib/types/message";
import { ServerSendSignal, type Packet } from "~/lib/types/packet";
import { createContext, useCallback, useContext, useState } from "react";

/**
 * Not to be confused with server-side ExchangeState,
 * this enum is client-side only and is necessary for UI changes
 */
export enum SpeakingExchangeState {
  IDLE = "IDLE",
  GUEST_SPEAKING = "GUEST_SPEAKING",
  CLONE_THINKING = "CLONE_THINKING",
  CLONE_SPEAKING = "CLONE_SPEAKING",
}

/**
 * Context specific to one particular room
 */
interface RoomStatusInterface {
  transcript: Message[];
  speakingExchangeState: SpeakingExchangeState;
  sendAppMessage: any; // no export from @daily-co
}

const RoomStatusContext = createContext<RoomStatusInterface | undefined>(
  undefined,
);

export function RoomStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [speakingExchangeState, setSpeakingExchangeState] = useState(
    SpeakingExchangeState.IDLE,
  );
  const onAppMessage = useCallback((ev: DailyEventObjectAppMessage<any>) => {
    try {
      const packet: Packet = JSON.parse(ev.data);
      console.log("=======PACKET:", packet);
      switch (packet.signal) {
        case ServerSendSignal.TRANSCRIPT_UPDATE:
          if (packet.message) {
            // @TODO: I don't know why non-null assertion operator is needed here
            setTranscript((prev) => [...prev, packet.message!]);
          }
          break;
      }
    } catch (err) {
      console.error("onAppMessage:", err);
    }
  }, []);
  const sendAppMessage = useAppMessage({ onAppMessage });

  return (
    <RoomStatusContext.Provider
      value={{ transcript, speakingExchangeState, sendAppMessage }}
    >
      {children}
    </RoomStatusContext.Provider>
  );
}

export function useRoomStatus() {
  const context = useContext(RoomStatusContext);
  if (!context) {
    throw new Error("useRoomStatus must be used within a <RoomStatusProvider>");
  }

  return context;
}
