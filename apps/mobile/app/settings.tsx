import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy first</Text>
        <Text style={styles.subtitle}>EchoRoom stores no personal data. Rooms are temporary and messages are deleted when time is up.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What we never collect</Text>
          {['Real names', 'Phone numbers', 'GPS/location', 'Device IDs'].map(item => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.bullet}>✕</Text>
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Storage & security</Text>
          <Text style={styles.body}>Messages live in-memory and expire after 24 hours. Rooms close automatically when their TTL runs out.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080a' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 32, color: '#e2e8f0', fontWeight: '900', marginTop: 12 },
  subtitle: { color: '#94a3b8', lineHeight: 22 },
  card: {
    backgroundColor: '#0f1316',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    gap: 10,
  },
  sectionTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '800' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { color: '#ef4444', fontWeight: '800', fontSize: 16 },
  rowText: { color: '#cbd5e1', fontSize: 14 },
  body: { color: '#cbd5e1', lineHeight: 20 },
});
