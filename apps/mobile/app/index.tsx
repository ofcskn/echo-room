import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { RecentRoom, getRecentRooms } from '@/utils/recentRooms';

export default function HomeScreen() {
  const router = useRouter();
  const [recents, setRecents] = useState<RecentRoom[]>([]);

  const loadRecents = useCallback(async () => {
    const rooms = await getRecentRooms();
    setRecents(rooms);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecents();
    }, [loadRecents])
  );

  useEffect(() => {
    loadRecents();
  }, [loadRecents]);

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroTag}><Text style={styles.heroTagText}>LIVE & ANONYMOUS</Text></View>
          <Text style={styles.title}>Chat without{'\n'}<Text style={styles.titleAccent}>a trace</Text></Text>
        <Text style={styles.subtitle}>Create temporary rooms that self-destruct. No accounts, no history—just secure, time-bound chats.</Text>

        <View style={styles.actions}>
          <Button title="Create a room" onPress={() => router.push('/create')} style={{ flex: 1 }} />
          <Button
            title="Join a room"
            variant="secondary"
            onPress={() => router.push('/join')}
            style={{ flex: 1 }}
          />
        </View>

        {recents.length > 0 && (
          <View style={styles.recents}>
            <Text style={styles.recentsTitle}>Recent rooms</Text>
            {recents.map(room => (
              <View key={room.id} style={styles.recentCard}>
                <View style={styles.recentInfo}>
                  <View style={[styles.recentIcon, room.isOwner ? styles.ownerIcon : styles.memberIcon]}>
                    <Text style={styles.recentIconText}>{room.isOwner ? '+' : '#'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.recentId}>echo-{room.id.slice(0, 4)}-{room.id.slice(-4)}</Text>
                    <Text style={styles.recentMeta}>
                      {room.isOwner ? 'Created by you' : 'Joined'} • Expires at {new Date(room.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron} onPress={() => router.push(`/room/${room.id}`)}>
                  →
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  heroTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(54,226,123,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(54,226,123,0.3)',
    marginTop: 12,
  },
  heroTagText: { color: '#36e27b', fontWeight: '800', letterSpacing: 2, fontSize: 12 },
  title: { color: '#f8fafc', fontSize: 42, fontWeight: '900', lineHeight: 46 },
  titleAccent: { color: '#36e27b' },
  subtitle: { color: '#94a3b8', fontSize: 16, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12 },
  recents: { marginTop: 12, gap: 8 },
  recentsTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  recentCard: {
    backgroundColor: '#0f1316',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  recentIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ownerIcon: { backgroundColor: 'rgba(54,226,123,0.15)', borderWidth: 1, borderColor: 'rgba(54,226,123,0.4)' },
  memberIcon: { backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)' },
  recentIconText: { color: '#e2e8f0', fontWeight: '800', fontSize: 18 },
  recentId: { color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14 },
  recentMeta: { color: '#64748b', fontSize: 12 },
  chevron: { color: '#94a3b8', fontSize: 24, paddingHorizontal: 8 },
});
