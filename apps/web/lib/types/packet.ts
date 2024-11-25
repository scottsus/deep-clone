import { Message } from "./message";

/**
 * Packets and signals sent & received to/from server-side to keep track of room status
 */

export enum ClientSendSignal {}

export enum ServerSendSignal {
  TRANSCRIPT_UPDATE = "transcript_update",
  CLONE_SPEECH_END = "clone_speech_end",
  CONVERSATION_END = "conversation_end",
}

export interface Packet {
  signal: ClientSendSignal | ServerSendSignal;
  message?: Message;
}
