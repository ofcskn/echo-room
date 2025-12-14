import { adapters } from '../adapters';
import { RoomRow } from '../types';

export const RoomService = {
  async getRoom(roomId: string): Promise<RoomRow | null> {
    return adapters.roomRepository.getRoom(roomId);
  },

  async createRoom(ttlSeconds: number): Promise<RoomRow> {
    return adapters.roomRepository.createRoom(ttlSeconds);
  },

  async joinRoom(roomId: string): Promise<RoomRow> {
    await adapters.roomRepository.joinRoom(roomId);
    const room = await adapters.roomRepository.getRoom(roomId);
    if (!room) throw new Error('ROOM_NOT_FOUND');
    return room;
  },
};
