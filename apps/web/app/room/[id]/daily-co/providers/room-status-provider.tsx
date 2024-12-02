import type { DailyEventObjectAppMessage } from "@daily-co/daily-js";
import { useAppMessage } from "@daily-co/daily-react";
import { Message } from "~/lib/types/message";
import {
  ClientSendSignal,
  ServerSendSignal,
  type Packet,
} from "~/lib/types/packet";
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
  handshakeIsComplete: boolean;
  speakingExchangeState: SpeakingExchangeState;
  setSpeakingExchangeState: React.Dispatch<
    React.SetStateAction<SpeakingExchangeState>
  >;
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
  const [handshakeIsComplete, setHandshakeIsComplete] = useState(false);
  const [speakingExchangeState, setSpeakingExchangeState] = useState(
    SpeakingExchangeState.IDLE,
  );
  // @TODO: unused for now
  const [conversationIsOngoing, setConversationIsOngoing] = useState(true);

  const onAppMessage = useCallback((ev: DailyEventObjectAppMessage<any>) => {
    try {
      const packet: Packet = JSON.parse(ev.data);
      switch (packet.signal) {
        case ServerSendSignal.GUEST_JOINED_SUCCESS_ACK:
          setHandshakeIsComplete(true);
          break;

        case ServerSendSignal.TRANSCRIPT_UPDATE:
          const { message } = packet;
          if (message) {
            setTranscript((prev) => [...prev, message]);
          }
          // when a transcript arrives, that means clone is ready to speak
          setSpeakingExchangeState(SpeakingExchangeState.CLONE_SPEAKING);
          break;

        case ServerSendSignal.CLONE_SPEECH_END:
          setSpeakingExchangeState(SpeakingExchangeState.GUEST_SPEAKING);
          break;

        case ServerSendSignal.CONVERSATION_END:
          setConversationIsOngoing(false);
          break;
      }
    } catch (err) {
      console.error("onAppMessage:", err);
    }
  }, []);
  const sendAppMessage = useAppMessage({ onAppMessage });

  return (
    <RoomStatusContext.Provider
      value={{
        transcript,
        handshakeIsComplete,
        speakingExchangeState,
        setSpeakingExchangeState,
        sendAppMessage,
      }}
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
