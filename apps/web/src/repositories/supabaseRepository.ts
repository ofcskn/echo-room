
import { IRoomRepository, IMessageRepository } from './interfaces';
import { RoomRow, MessageRow, CreateRoomDTO, JoinRoomDTO, SendMessageDTO } from '../types';
import { supabase } from '../utils/supabase';

export class SupabaseRoomRepository implements IRoomRepository {
  async createRoom(dto: CreateRoomDTO): Promise<RoomRow> {
    // 1. Create room
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        created_by: dto.userId,
        ttl_seconds: dto.ttlSeconds,
        // Server typically handles expires_at via database function/trigger 
        // or we calculate here if RLS allows. Assuming server trigger or client calc allowed.
        // For this impl, we let Supabase defaults handle created_at, 
        // but we must provide expires_at if the DB doesn't compute it.
        // Let's compute it client side for robustness if triggers aren't set.
        expires_at: new Date(Date.now() + dto.ttlSeconds * 1000).toISOString(), 
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Join room (creator automatically joins)
    await this.joinRoom({ roomId: data.id, userId: dto.userId });

    return data as RoomRow;
  }

  async getRoom(roomId: string): Promise<RoomRow | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) return null;
    return data as RoomRow;
  }

  async joinRoom(dto: JoinRoomDTO): Promise<void> {
    const { error } = await supabase
      .from('room_members')
      .upsert({ room_id: dto.roomId, user_id: dto.userId }, { onConflict: 'room_id,user_id' });
    
    if (error) throw error;
  }
}

export class SupabaseMessageRepository implements IMessageRepository {
  async sendMessage(dto: SendMessageDTO): Promise<MessageRow> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: dto.roomId,
        sender_id: dto.senderId,
        content: dto.content,
        client_msg_id: dto.clientMsgId
      })
      .select()
      .single();

    if (error) throw error;
    return data as MessageRow;
  }

  async getMessages(roomId: string, limit = 50): Promise<MessageRow[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as MessageRow[];
  }

  subscribeToMessages(
    roomId: string, 
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR') => void
  ): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          onMessage(payload.new as MessageRow);
        }
      )
      .subscribe((status) => {
        onStatusChange?.(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToPresence(
    roomId: string,
    userId: string,
    onCountChange: (count: number) => void
  ): () => void {
    // Use a separate channel name to avoid conflicts or complex state management with the message channel
    const channel = supabase.channel(`presence:${roomId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // Supabase presence state keys are user_ids if set up that way, or random UUIDs.
        // We just want the count of unique users or connections.
        onCountChange(Object.keys(newState).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            user_id: userId, 
            online_at: new Date().toISOString() 
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }
}
