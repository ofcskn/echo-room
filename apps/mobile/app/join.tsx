import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { AuthService } from '@/services/authService';
import { RoomService } from '@/services/roomService';
import { addRecentRoom } from '@/utils/recentRooms';

export default function JoinRoomScreen() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    setError('');
    try {
      await AuthService.ensureAuthenticated();
      const room = await RoomService.joinRoom(roomId.trim());
      await addRecentRoom(room, false);
      router.push(`/room/${room.id}`);
    } catch (e: any) {
      if (e?.message === 'ROOM_EXPIRED') setError('This room has expired.');
      else if (e?.message === 'ROOM_NOT_FOUND') setError('Room not found.');
      else setError('Room not found or invalid ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Join a room</Text>
        <Text style={styles.subtitle}>Enter the room ID shared with you. Rooms expire automatically to keep chats private.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>ROOM ID</Text>
          <TextInput
            placeholder="echo-xxxx-xxxx"
            placeholderTextColor="#475569"
            value={roomId}
            onChangeText={setRoomId}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, error && styles.inputError]}
          />
          <Text style={styles.errorText}>{error || 'Use the code shared by the host.'}</Text>

          <Button title="Join room" onPress={handleJoin} loading={loading} disabled={!roomId} />
          <Text style={styles.helper}>Rooms expire after 24 hours.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  title: { color: '#f8fafc', fontSize: 34, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22 },
  card: {
    marginTop: 12,
    backgroundColor: '#0f1316',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 14,
  },
  label: { color: '#9ca3af', fontWeight: '700', letterSpacing: 1 },
  input: {
    backgroundColor: '#0b1012',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12 },
  helper: { color: '#64748b', textAlign: 'center', fontSize: 12 },
});
