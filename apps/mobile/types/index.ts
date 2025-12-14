export type RoomStatus = "active" | "expired";

export interface RoomRow {
  id: string; // uuid
  created_by: string; // uuid
  created_at: string; // ISO
  expires_at: string; // ISO
  status: RoomStatus;
  ttl_seconds: number;
}

export interface RoomMemberRow {
  room_id: string; // uuid
  user_id: string; // uuid
  joined_at: string; // ISO
}

export interface MessageRow {
  id: string; // uuid
  room_id: string; // uuid
  sender_id: string; // uuid
  created_at: string; // ISO
  content: string;
  client_msg_id: string; // uuid
}

export type CreateRoomDTO = {
  ttlSeconds: number;
  userId: string;
};

export type JoinRoomDTO = {
  roomId: string;
  userId: string;
};

export type SendMessageDTO = {
  roomId: string;
  senderId: string;
  content: string;
  clientMsgId: string;
};
