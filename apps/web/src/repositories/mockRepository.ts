import { MessageRow, RoomRow } from "../types";
import { IAuthRepository, IMessageRepository, IRoomRepository } from "./interfaces";

/* =========================
   In-memory state (mock DB)
   ========================= */

const rooms = new Map<string, RoomRow>();
const members = new Map<string, Set<string>>(); // roomId -> Set<userId>
const messages = new Map<string, MessageRow[]>(); // roomId -> messages[]
const presenceMap = new Map<string, Set<string>>(); // roomId -> Set<connectionId>

// Simple Event Bus for mock realtime
const bus = new EventTarget();

/* =========================
   Helpers
   ========================= */

function nowIso() {
  return new Date().toISOString();
}

function getRoomOrThrow(roomId: string): RoomRow {
  const room = rooms.get(roomId);
  if (!room) throw new Error("ROOM_NOT_FOUND");
  return room;
}

function isExpired(room: RoomRow): boolean {
  return room.status === "expired" || new Date(room.expires_at).getTime() <= Date.now();
}

function normalizeRoomStatus(room: RoomRow): RoomRow {
  if (room.status === "expired") return room;
  if (new Date(room.expires_at).getTime() <= Date.now()) {
    const expired: RoomRow = { ...room, status: "expired" };
    rooms.set(room.id, expired);
    return expired;
  }
  return room;
}

/* =========================
   AUTH (mock)
   ========================= */

export class MockAuthRepository implements IAuthRepository {
  async ensureAuthenticated(): Promise<void> {
    // Ensure a stable mock identity exists
    let mockId = localStorage.getItem("echo_mock_user_id");
    if (!mockId) {
      mockId = crypto.randomUUID();
      localStorage.setItem("echo_mock_user_id", mockId);
    }
  }

  // Optional helper (not in interface) for adapters that need user id internally
  async _getUserId(): Promise<string> {
    await this.ensureAuthenticated();
    const id = localStorage.getItem("echo_mock_user_id");
    if (!id) throw new Error("MOCK_AUTH_NOT_INITIALIZED");
    return id;
  }
}

/* =========================
   ROOMS (mock)
   ========================= */

export class MockRoomRepository implements IRoomRepository {
  constructor(private auth: MockAuthRepository) {}

  async createRoom(ttlSeconds: number): Promise<RoomRow> {
    const userId = await this.auth._getUserId();

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

    const room: RoomRow = {
      id,
      created_by: userId,
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: "active",
      ttl_seconds: ttlSeconds
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
    const userId = await this.auth._getUserId();

    const room = normalizeRoomStatus(getRoomOrThrow(roomId));
    if (isExpired(room)) throw new Error("ROOM_EXPIRED");

    const roomMembers = members.get(roomId) ?? new Set<string>();
    roomMembers.add(userId);
    members.set(roomId, roomMembers);
  }
}

/* =========================
   MESSAGES (mock)
   ========================= */

export class MockMessageRepository implements IMessageRepository {
  constructor(private auth: MockAuthRepository) {}

  async sendMessage(roomId: string, content: string, clientMsgId: string): Promise<MessageRow> {
    const userId = await this.auth._getUserId();

    const room = normalizeRoomStatus(getRoomOrThrow(roomId));
    if (isExpired(room)) throw new Error("ROOM_EXPIRED");

    const roomMembers = members.get(roomId);
    if (!roomMembers || !roomMembers.has(userId)) throw new Error("NOT_A_MEMBER");

    const msg: MessageRow = {
      id: crypto.randomUUID(),
      room_id: roomId,
      sender_id: userId,
      content,
      created_at: nowIso(),
      client_msg_id: clientMsgId
    };

    const roomMsgs = messages.get(roomId) ?? [];
    roomMsgs.push(msg);
    messages.set(roomId, roomMsgs);

    // Simulate realtime "INSERT" event
    bus.dispatchEvent(new CustomEvent(`message:${roomId}`, { detail: msg }));

    return msg;
  }

  async getMessages(roomId: string, limit = 50): Promise<MessageRow[]> {
    const roomMsgs = messages.get(roomId) ?? [];
    // Return last N, ascending by created_at
    return roomMsgs.slice(Math.max(0, roomMsgs.length - limit));
  }

  subscribeToMessages(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: "SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR") => void
  ): () => void {
    // Mimic Supabase channel status behavior
    setTimeout(() => onStatusChange?.("SUBSCRIBED"), 0);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<MessageRow>;
      onMessage(customEvent.detail);
    };

    const eventName = `message:${roomId}`;
    bus.addEventListener(eventName, handler);

    return () => {
      bus.removeEventListener(eventName, handler);
      onStatusChange?.("CLOSED");
    };
  }

  subscribeToPresence(
    roomId: string,
    onCountChange: (count: number) => void
  ): () => void {
    // Presence represents open connections (tabs), not users
    const connectionId = crypto.randomUUID();

    if (!presenceMap.has(roomId)) presenceMap.set(roomId, new Set());
    const set = presenceMap.get(roomId)!;
    set.add(connectionId);

    const emit = () => {
      const count = presenceMap.get(roomId)?.size ?? 0;
      bus.dispatchEvent(new CustomEvent(`presence:${roomId}`, { detail: count }));
    };

    // Initial emit (sync)
    emit();
    onCountChange(set.size);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      onCountChange(customEvent.detail);
    };

    const eventName = `presence:${roomId}`;
    bus.addEventListener(eventName, handler);

    return () => {
      const roomSet = presenceMap.get(roomId);
      if (roomSet) {
        roomSet.delete(connectionId);
        emit();
      }
      bus.removeEventListener(eventName, handler);
    };
  }
}
