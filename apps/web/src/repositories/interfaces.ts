import { MessageRow, RoomRow } from "../types";

export interface IRoomRepository {
  createRoom(ttlSeconds: number): Promise<RoomRow>;
  getRoom(roomId: string): Promise<RoomRow | null>;
  joinRoom(roomId: string): Promise<void>;
}

export interface IMessageRepository {
  sendMessage(
    roomId: string,
    content: string,
    clientMsgId: string
  ): Promise<MessageRow>;

  getMessages(roomId: string, limit?: number): Promise<MessageRow[]>;

  subscribeToMessages(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: "SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR") => void
  ): () => void;

  subscribeToPresence(
    roomId: string,
    onCountChange: (count: number) => void
  ): () => void;
}

export interface IAuthRepository {
  ensureAuthenticated(): Promise<void>;
}
