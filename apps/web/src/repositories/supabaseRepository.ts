import {
  IAuthRepository,
  IMessageRepository,
  IRoomRepository
} from "./interfaces";

import { MessageRow, RoomRow } from "../types";
import { supabase } from "../utils/supabase";

/* ========================= AUTH ========================= */

export class SupabaseAuthRepository implements IAuthRepository {
  async ensureAuthenticated(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (data.session) return;

    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}

/* ========================= ROOMS ========================= */

export class SupabaseRoomRepository implements IRoomRepository {
  async createRoom(ttlSeconds: number): Promise<RoomRow> {
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        ttl_seconds: ttlSeconds
        // created_by → trigger (auth.uid)
        // expires_at → trigger
        // status → default
      })
      .select()
      .single();

    if (error) throw error;
    return data as RoomRow;
  }

  async getRoom(roomId: string): Promise<RoomRow | null> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) return null;
    return data as RoomRow;
  }

  async joinRoom(roomId: string): Promise<void> {
    const { error } = await supabase
      .from("room_members")
      .insert({
        room_id: roomId
        // user_id → trigger or RLS via auth.uid()
      });

    if (error) throw error;
  }
}

/* ========================= MESSAGES ========================= */

export class SupabaseMessageRepository implements IMessageRepository {
  async sendMessage(
    roomId: string,
    content: string,
    clientMsgId: string
  ): Promise<MessageRow> {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        content,
        client_msg_id: clientMsgId
        // sender_id → trigger (auth.uid)
      })
      .select()
      .single();

    if (error) throw error;
    return data as MessageRow;
  }

  async getMessages(roomId: string, limit = 50): Promise<MessageRow[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as MessageRow[];
  }

  subscribeToMessages(
    roomId: string,
    onMessage: (msg: MessageRow) => void,
    onStatusChange?: (status: "SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR") => void
  ): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
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
    onCountChange: (count: number) => void
  ): () => void {
    const channel = supabase.channel(`presence:${roomId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        onCountChange(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }
}
