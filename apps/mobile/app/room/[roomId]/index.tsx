import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { AuthService } from '@/services/authService';
import { MessageService } from '@/services/messageService';
import { RoomService } from '@/services/roomService';
import { MessageRow, RoomRow } from '@/types';

const dedupeAndSortMessages = (list: MessageRow[]) => {
  const unique: MessageRow[] = [];
  for (const msg of list) {
    const existingIndex = unique.findIndex(
      m => m.id === msg.id || (msg.client_msg_id && m.client_msg_id === msg.client_msg_id)
    );
    if (existingIndex >= 0) unique[existingIndex] = msg;
    else unique.push(msg);
  }
  return unique.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export default function RoomChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [room, setRoom] = useState<RoomRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [userCount, setUserCount] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);

  const subscriptionRef = useRef<{ unsubscribeMessages: () => void; unsubscribePresence: () => void } | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    const init = async () => {
      await AuthService.ensureAuthenticated();
      const uid = await AuthService.getUserId();
      if (cancelled) return;
      setCurrentUserId(uid);

      const r = await RoomService.getRoom(roomId);
      if (cancelled) return;
      if (!r) {
        router.replace('/');
        return;
      }
      if (r.status !== 'active' || new Date(r.expires_at) <= new Date()) {
        router.replace(`/room/${roomId}/ended`);
        return;
      }

      setRoom(r);
      const initial = await MessageService.loadMessages(roomId);
      if (!cancelled) setMessages(dedupeAndSortMessages(initial));

      subscriptionRef.current?.unsubscribeMessages?.();
      subscriptionRef.current?.unsubscribePresence?.();

      const unsubscribeMessages = MessageService.subscribe(
        roomId,
        msg => setMessages(prev => dedupeAndSortMessages([...prev, msg])),
        status => {
          if (status === 'SUBSCRIBED') setConnectionStatus('connected');
          else if (status === 'CHANNEL_ERROR') setConnectionStatus('disconnected');
          else setConnectionStatus('connecting');
        }
      );

      const unsubscribePresence = MessageService.subscribeToPresence(roomId, setUserCount);
      subscriptionRef.current = { unsubscribeMessages, unsubscribePresence };
    };

    init();

    return () => {
      cancelled = true;
      subscriptionRef.current?.unsubscribeMessages?.();
      subscriptionRef.current?.unsubscribePresence?.();
      subscriptionRef.current = null;
    };
  }, [roomId, router]);

  useEffect(() => {
    if (!roomId) return;
    const pollMessages = async () => {
      const latest = await MessageService.loadMessages(roomId);
      setMessages(prev => dedupeAndSortMessages([...prev, ...latest]));
    };
    pollMessages();
    pollerRef.current = setInterval(pollMessages, 3000);
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
      pollerRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, [messages.length]);

  useEffect(() => {
    if (!room) return;
    const tick = () => {
      const remainingMs = new Date(room.expires_at).getTime() - Date.now();
      setRemaining(Math.max(0, remainingMs));
      if (remainingMs <= 0) {
        setIsExpired(true);
        router.replace({ pathname: `/room/${room.id}/ended`, params: { messageCount: messages.length.toString() } });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [room, messages.length, router]);

  const sendMessage = async () => {
    if (!text.trim() || !roomId || isExpired || isSending) return;
    const content = text.trim();
    setText('');
    setIsSending(true);
    const clientMsgId = crypto.randomUUID();
    try {
      const persisted = await MessageService.sendMessage(roomId, content, clientMsgId);
      setMessages(prev => dedupeAndSortMessages([...prev, persisted]));
    } catch {
      setText(content);
    } finally {
      setIsSending(false);
    }
  };

  if (!room) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.subtitle}>Initializing…</Text>
      </SafeAreaView>
    );
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/') } style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.roomId}>echo-{room.id.slice(0, 4)}</Text>
          <Text style={styles.metaText}>{userCount} online • {messages.length} msgs</Text>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{minutes}:{seconds}</Text>
        </View>
      </View>

      {connectionStatus !== 'connected' && (
        <View style={styles.banner}><Text style={styles.bannerText}>{connectionStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}</Text></View>
      )}

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
        <Text style={styles.system}>Session started</Text>
        {messages.map(msg => {
          const isSelf = msg.sender_id === currentUserId;
          return (
            <View
              key={`${msg.id}-${msg.client_msg_id}`}
              style={[styles.bubble, isSelf ? styles.selfBubble : styles.peerBubble]}
            >
              {!isSelf && <Text style={styles.sender}>Anon</Text>}
              <Text style={isSelf ? styles.selfText : styles.peerText}>{msg.content}</Text>
              <Text style={[styles.timestamp, isSelf && styles.selfTimestamp]}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          placeholder={isExpired ? 'Room expired' : 'Type a message'}
          placeholderTextColor="#475569"
          value={text}
          onChangeText={setText}
          editable={!isExpired && connectionStatus === 'connected'}
          multiline
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} loading={isSending} disabled={!text.trim() || isExpired || connectionStatus !== 'connected'} style={styles.sendButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f1316',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  headerButtonText: { color: '#e2e8f0', fontWeight: '700' },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  roomId: { color: '#e2e8f0', fontFamily: 'monospace', fontSize: 16 },
  metaText: { color: '#64748b', fontSize: 12 },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(54,226,123,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(54,226,123,0.4)',
  },
  timerText: { color: '#36e27b', fontWeight: '800', fontVariant: ['tabular-nums'] },
  banner: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  bannerText: { color: '#e2e8f0', fontWeight: '700' },
  messages: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  system: { color: '#94a3b8', textAlign: 'center', fontSize: 12 },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    backgroundColor: '#0f1316',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  selfBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#36e27b',
    borderColor: '#36e27b',
  },
  peerBubble: {},
  sender: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  selfText: { color: '#0b1012', fontSize: 16, fontWeight: '700' },
  peerText: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  timestamp: { color: '#94a3b8', fontSize: 11, marginTop: 6 },
  selfTimestamp: { color: '#0b1012' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#0f1316',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e2e8f0',
  },
  sendButton: { width: 100 },
});
