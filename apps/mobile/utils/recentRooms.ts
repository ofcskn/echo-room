import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoomRow } from '../types';

const KEY = 'echo_recent_rooms';

export interface RecentRoom {
  id: string;
  created_at: string;
  expires_at: string;
  isOwner: boolean;
}

export const getRecentRooms = async (): Promise<RecentRoom[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentRoom = async (room: RoomRow, isOwner: boolean) => {
  const rooms = await getRecentRooms();
  const now = new Date();
  const filtered = rooms.filter(r => r.id !== room.id && new Date(r.expires_at) > now);

  const newRoom: RecentRoom = {
    id: room.id,
    created_at: room.created_at,
    expires_at: room.expires_at,
    isOwner,
  };

  const updated = [newRoom, ...filtered].slice(0, 5);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};
