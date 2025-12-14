import { RoomRow } from '../types';

const KEY = 'echo_recent_rooms';

export interface RecentRoom {
  id: string;
  created_at: string;
  expires_at: string;
  isOwner: boolean;
}

export const getRecentRooms = (): RecentRoom[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentRoom = (room: RoomRow, isOwner: boolean) => {
  const rooms = getRecentRooms();
  
  // Filter out existing entry for this room and expired rooms (lazy cleanup)
  const now = new Date();
  const filtered = rooms.filter(r => 
    r.id !== room.id && new Date(r.expires_at) > now
  );

  const newRoom: RecentRoom = {
    id: room.id,
    created_at: room.created_at,
    expires_at: room.expires_at,
    isOwner
  };

  // Add to top, max 5
  const updated = [newRoom, ...filtered].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(updated));
};