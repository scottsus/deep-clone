import { Message } from "./message";

/**
 * Packets and signals sent & received to/from server-side to keep track of room status
 */

export enum ClientSendSignal {}

export enum ServerSendSignal {
  TRANSCRIPT_UPDATE = "transcript_update",
}

export interface Packet {
  signal: ClientSendSignal | ServerSendSignal;
  message?: Message;
}
