
import { IRoomRepository, IMessageRepository, IAuthRepository } from './interfaces';
import { RoomRow, MessageRow, CreateRoomDTO, JoinRoomDTO, SendMessageDTO } from '../types';

// In-memory store
const rooms = new Map<string, RoomRow>();
const members = new Map<string, Set<string>>(); // roomId -> Set<userId>
const messages = new Map<string, MessageRow[]>(); // roomId -> messages[]

// Presence store for mock
const presenceMap = new Map<string, Set<string>>(); // roomId -> Set<connectionId>

// Simple Event Bus for Mock Realtime
const bus = new EventTarget();

export class MockRoomRepository implements IRoomRepository {
  async createRoom(dto: CreateRoomDTO): Promise<RoomRow> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + dto.ttlSeconds * 1000);
    
    const room: RoomRow = {
      id,
      created_by: dto.userId,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      ttl_seconds: dto.ttlSeconds,
    };
    
    rooms.set(id, room);
    members.set(id, new Set([dto.userId]));
    return room;
  }

  async getRoom(roomId: string): Promise<RoomRow | null> {
    return rooms.get(roomId) || null;
  }

  async joinRoom(dto: JoinRoomDTO): Promise<void> {
    const room = rooms.get(dto.roomId);
    if (!room) throw new Error("ROOM_NOT_FOUND");
    
    const roomMembers = members.get(dto.roomId) || new Set();
    roomMembers.add(dto.userId);
    members.set(dto.roomId, roomMembers);
  }
}

export class MockMessageRepository implements IMessageRepository {
  async sendMessage(dto: SendMessageDTO): Promise<MessageRow> {
    const msg: MessageRow = {
      id: crypto.randomUUID(),
      room_id: dto.roomId,
      sender_id: dto.senderId,
      content: dto.content,
      created_at: new Date().toISOString(),
      client_msg_id: dto.clientMsgId
    };
    
    const roomMsgs = messages.get(dto.roomId) || [];
    roomMsgs.push(msg);
    messages.set(dto.roomId, roomMsgs);
    
    // Simulate realtime broadcast
    bus.dispatchEvent(new CustomEvent(`message:${dto.roomId}`, { detail: msg }));
    
    return msg;
  }

  async getMessages(roomId: string, limit = 50): Promise<MessageRow[]> {
    return messages.get(roomId) || [];
  }

  subscribeToMessages(
    roomId: string, 
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: any) => void
  ): () => void {
    // Notify connected immediately
    setTimeout(() => onStatusChange?.('SUBSCRIBED'), 50);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<MessageRow>;
      onMessage(customEvent.detail);
    };

    const eventName = `message:${roomId}`;
    bus.addEventListener(eventName, handler);

    return () => {
      bus.removeEventListener(eventName, handler);
      onStatusChange?.('CLOSED');
    };
  }

  subscribeToPresence(
    roomId: string,
    userId: string,
    onCountChange: (count: number) => void
  ): () => void {
    // Generate a unique connection ID to simulate multiple tabs even if same user
    const connectionId = `${userId}:${crypto.randomUUID()}`;
    
    if (!presenceMap.has(roomId)) {
      presenceMap.set(roomId, new Set());
    }
    const roomSet = presenceMap.get(roomId)!;
    roomSet.add(connectionId);

    const emit = () => {
      const count = presenceMap.get(roomId)?.size || 0;
      bus.dispatchEvent(new CustomEvent(`presence:${roomId}`, { detail: count }));
    };

    // Initial emit
    setTimeout(() => emit(), 0);
    onCountChange(roomSet.size);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      onCountChange(customEvent.detail);
    };

    const eventName = `presence:${roomId}`;
    bus.addEventListener(eventName, handler);

    return () => {
      const set = presenceMap.get(roomId);
      if (set) {
        set.delete(connectionId);
        emit();
      }
      bus.removeEventListener(eventName, handler);
    };
  }
}

export class MockAuthRepository implements IAuthRepository {
  async getUserId(): Promise<string> {
    // Return a stable mock ID for the session to persist identity across refreshes
    let mockId = localStorage.getItem('echo_mock_user_id');
    if (!mockId) {
      mockId = crypto.randomUUID();
      localStorage.setItem('echo_mock_user_id', mockId);
    }
    return mockId;
  }
}
