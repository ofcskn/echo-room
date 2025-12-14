
import { RoomRow, MessageRow, CreateRoomDTO, JoinRoomDTO, SendMessageDTO } from '../types';

export interface IRoomRepository {
  createRoom(dto: CreateRoomDTO): Promise<RoomRow>;
  getRoom(roomId: string): Promise<RoomRow | null>;
  joinRoom(dto: JoinRoomDTO): Promise<void>;
}

export interface IMessageRepository {
  sendMessage(dto: SendMessageDTO): Promise<MessageRow>;
  getMessages(roomId: string, limit?: number): Promise<MessageRow[]>;
  subscribeToMessages(
    roomId: string, 
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR') => void
  ): () => void; // Returns unsubscribe function
  subscribeToPresence(
    roomId: string,
    userId: string,
    onCountChange: (count: number) => void
  ): () => void;
}
