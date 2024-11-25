import { Message } from "./message";

/**
 * Packets and signals sent & received to/from server-side to keep track of room status
 */

export enum ClientSendSignal {
  GUEST_JOINED_SUCCESS = "GUEST_JOINED_SUCCESS",
  GUEST_SPEECH_END = "GUEST_SPEECH_END",
}

export enum ServerSendSignal {
  TRANSCRIPT_UPDATE = "TRANSCRIPT_UPDATE",
  CLONE_SPEECH_END = "CLONE_SPEECH_END",
  CONVERSATION_END = "CONVERSATION_END",
}

export interface Packet {
  signal: ClientSendSignal | ServerSendSignal;
  message?: Message;
}
