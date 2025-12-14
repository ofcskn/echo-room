import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';

export default function RoomEndedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ messageCount?: string; duration?: string; endTime?: string }>();

  const messageCount = params.messageCount ? Number(params.messageCount) : 42;
  const duration = params.duration || '00:45';
  const endTime = params.endTime || '10:34';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✕</Text>
        </View>
        <Text style={styles.title}>Room ended</Text>
        <Text style={styles.subtitle}>This session has expired. Messages are cleared automatically for your privacy.</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MESSAGES</Text>
            <Text style={styles.statValue}>{messageCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>{duration}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ENDED AT</Text>
            <Text style={styles.statValue}>{endTime}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="New room" onPress={() => router.replace('/create')} style={{ flex: 1 }} />
          <Button
            title="Back home"
            variant="secondary"
            onPress={() => router.replace('/')}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Messages are not archived. Nothing was stored on your device.</Text>
          <Text style={styles.footerText}>Start a fresh conversation anytime.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  content: { padding: 20, alignItems: 'center', gap: 16, paddingBottom: 40 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0f1316',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  icon: { fontSize: 32, color: '#36e27b', fontWeight: '900' },
  title: { fontSize: 34, fontWeight: '900', color: '#e2e8f0', textAlign: 'center' },
  subtitle: { color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f1316',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: { color: '#9ca3af', fontSize: 11, letterSpacing: 1, fontWeight: '800' },
  statValue: { color: '#36e27b', fontSize: 22, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  footer: { gap: 4, marginTop: 8 },
  footerText: { color: '#64748b', fontSize: 12, textAlign: 'center' },
});
