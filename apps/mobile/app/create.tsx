import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { AuthService } from '@/services/authService';
import { RoomService } from '@/services/roomService';

const TTL_OPTIONS = [
  { label: '5', sub: 'min', value: 300 },
  { label: '10', sub: 'min', value: 600 },
  { label: '15', sub: 'min', value: 900 },
  { label: '30', sub: 'min', value: 1800 },
];

export default function CreateRoomScreen() {
  const router = useRouter();
  const [selectedTTL, setSelectedTTL] = useState(300);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await AuthService.ensureAuthenticated();
      const room = await RoomService.createRoom(selectedTTL);
      router.push(`/room/${room.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Start a temporary{'\n'}<Text style={styles.titleAccent}>conversation</Text></Text>
        <Text style={styles.subtitle}>Choose how long the room stays live. Messages vanish when the timer ends.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ROOM TTL</Text>
          <View style={styles.ttlGrid}>
            {TTL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.ttlOption, selectedTTL === opt.value && styles.ttlOptionSelected]}
                onPress={() => setSelectedTTL(opt.value)}
              >
                <Text style={[styles.ttlLabel, selectedTTL === opt.value && styles.ttlLabelActive]}>{opt.label}</Text>
                <Text style={[styles.ttlSub, selectedTTL === opt.value && styles.ttlLabelActive]}>{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Create room" onPress={handleCreate} loading={loading} />
          <Text style={styles.helperText}>Rooms expire automatically. Nothing is stored.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  content: { padding: 20, gap: 18, paddingBottom: 60 },
  title: { color: '#f8fafc', fontSize: 32, fontWeight: '900', lineHeight: 36, marginTop: 12 },
  titleAccent: { color: '#36e27b' },
  subtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22 },
  card: {
    marginTop: 12,
    backgroundColor: '#0f1316',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 16,
  },
  sectionLabel: { color: '#9ca3af', fontWeight: '700', letterSpacing: 1 },
  ttlGrid: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  ttlOption: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  ttlOptionSelected: {
    backgroundColor: '#36e27b',
    borderColor: '#36e27b',
    shadowColor: '#36e27b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  ttlLabel: { fontSize: 22, fontWeight: '800', color: '#cbd5e1' },
  ttlLabelActive: { color: '#05080a' },
  ttlSub: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  helperText: { textAlign: 'center', color: '#64748b', fontSize: 12 },
});
