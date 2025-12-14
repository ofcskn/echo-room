import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageRow, RoomRow } from '../types';
import { IAuthRepository, IMessageRepository, IRoomRepository } from './interfaces';

const rooms = new Map<string, RoomRow>();
const members = new Map<string, Set<string>>();
const messages = new Map<string, MessageRow[]>();
const presenceMap = new Map<string, Set<string>>();
const listeners = new Map<string, Set<(payload: any) => void>>();

const emit = (event: string, payload: any) => {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach(handler => handler(payload));
};

const subscribeEvent = (event: string, handler: (payload: any) => void) => {
  const set = listeners.get(event) ?? new Set<(payload: any) => void>();
  set.add(handler);
  listeners.set(event, set);
  return () => {
    const current = listeners.get(event);
    if (!current) return;
    current.delete(handler);
    if (current.size === 0) listeners.delete(event);
  };
};

const nowIso = () => new Date().toISOString();

const getRoomOrThrow = (roomId: string): RoomRow => {
  const room = rooms.get(roomId);
  if (!room) throw new Error('ROOM_NOT_FOUND');
  return room;
};

const isExpired = (room: RoomRow) => room.status === 'expired' || new Date(room.expires_at).getTime() <= Date.now();

const normalizeRoomStatus = (room: RoomRow): RoomRow => {
  if (room.status === 'expired') return room;
  if (new Date(room.expires_at).getTime() <= Date.now()) {
    const expired: RoomRow = { ...room, status: 'expired' };
    rooms.set(room.id, expired);
    return expired;
  }
  return room;
};

export class MockAuthRepository implements IAuthRepository {
  async ensureAuthenticated(): Promise<void> {
    let mockId = await AsyncStorage.getItem('echo_mock_user_id');
    if (!mockId) {
      mockId = crypto.randomUUID();
      await AsyncStorage.setItem('echo_mock_user_id', mockId);
    }
  }

  async getUserId(): Promise<string> {
    await this.ensureAuthenticated();
    const id = await AsyncStorage.getItem('echo_mock_user_id');
    if (!id) throw new Error('MOCK_AUTH_NOT_INITIALIZED');
    return id;
  }
}

export class MockRoomRepository implements IRoomRepository {
  constructor(private auth: MockAuthRepository) {}

  async createRoom(ttlSeconds: number): Promise<RoomRow> {
    const userId = await this.auth.getUserId();
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

    const room: RoomRow = {
      id,
      created_by: userId,
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      ttl_seconds: ttlSeconds,
    };

    rooms.set(id, room);
    members.set(id, new Set([userId]));

    return room;
  }

  async getRoom(roomId: string): Promise<RoomRow | null> {
    const room = rooms.get(roomId);
    if (!room) return null;
    return normalizeRoomStatus(room);
  }

  async joinRoom(roomId: string): Promise<void> {
    const userId = await this.auth.getUserId();
    const room = normalizeRoomStatus(getRoomOrThrow(roomId));
    if (isExpired(room)) throw new Error('ROOM_EXPIRED');
    const roomMembers = members.get(roomId) ?? new Set<string>();
    roomMembers.add(userId);
    members.set(roomId, roomMembers);
  }
}

export class MockMessageRepository implements IMessageRepository {
  constructor(private auth: MockAuthRepository) {}

  async sendMessage(roomId: string, content: string, clientMsgId: string): Promise<MessageRow> {
    const userId = await this.auth.getUserId();
    const room = normalizeRoomStatus(getRoomOrThrow(roomId));
    if (isExpired(room)) throw new Error('ROOM_EXPIRED');

    const roomMembers = members.get(roomId);
    if (!roomMembers || !roomMembers.has(userId)) throw new Error('NOT_A_MEMBER');

    const msg: MessageRow = {
      id: crypto.randomUUID(),
      room_id: roomId,
      sender_id: userId,
      content,
      created_at: nowIso(),
      client_msg_id: clientMsgId,
    };

    const roomMsgs = messages.get(roomId) ?? [];
    roomMsgs.push(msg);
    messages.set(roomId, roomMsgs);

    emit(`message:${roomId}`, msg);
    return msg;
  }

  async getMessages(roomId: string, limit = 50): Promise<MessageRow[]> {
    const roomMsgs = messages.get(roomId) ?? [];
    return roomMsgs.slice(Math.max(0, roomMsgs.length - limit));
  }

  subscribeToMessages(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR') => void
  ): () => void {
    setTimeout(() => onStatusChange?.('SUBSCRIBED'), 0);
    const unsub = subscribeEvent(`message:${roomId}`, onMessage);
    return () => {
      unsub();
      onStatusChange?.('CLOSED');
    };
  }

  subscribeToPresence(roomId: string, onCountChange: (count: number) => void): () => void {
    const connectionId = crypto.randomUUID();
    if (!presenceMap.has(roomId)) presenceMap.set(roomId, new Set());
    const set = presenceMap.get(roomId)!;
    set.add(connectionId);

    const emitPresence = () => {
      const count = presenceMap.get(roomId)?.size ?? 0;
      emit(`presence:${roomId}`, count);
    };

    emitPresence();
    onCountChange(set.size);

    const unsub = subscribeEvent(`presence:${roomId}`, onCountChange);

    return () => {
      const current = presenceMap.get(roomId);
      current?.delete(connectionId);
      emitPresence();
      unsub();
    };
  }
}
