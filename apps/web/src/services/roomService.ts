import { adapters } from '../adapters';
import { RoomRow } from '../types';

export const RoomService = {
  async createRoom(userId: string, ttlSeconds: number): Promise<RoomRow> {
    return await adapters.roomRepository.createRoom({ userId, ttlSeconds });
  },

  async joinRoom(userId: string, roomId: string): Promise<RoomRow> {
    const room = await adapters.roomRepository.getRoom(roomId);
    if (!room) throw new Error("ROOM_NOT_FOUND");
    
    // Logic: check expiration before joining
    if (new Date(room.expires_at) < new Date() || room.status !== 'active') {
      throw new Error("ROOM_EXPIRED");
    }

    await adapters.roomRepository.joinRoom({ roomId, userId });
    return room;
  },

  async getRoom(roomId: string): Promise<RoomRow | null> {
    return await adapters.roomRepository.getRoom(roomId);
  }
};
