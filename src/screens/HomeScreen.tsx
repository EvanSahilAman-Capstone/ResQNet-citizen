import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Citizen  Portal</Text>
        <Text style={styles.title}>Stay safe during wildfire danger.</Text>
        <Text style={styles.subtitle}>
          Review active alerts, check the safety map, and report wildfire activity to responders.
        </Text>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Alerts')}
      >
        <Text style={styles.primaryButtonText}>View Active Alerts</Text>
      </Pressable>

      <View style={styles.grid}>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.cardTitle}>Safety Map</Text>
          <Text style={styles.cardText}>
            See wildfire zones, impact radius, and danger areas.
          </Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Upload')}
        >
          <Text style={styles.cardTitle}>Report a Wildfire</Text>
          <Text style={styles.cardText}>
            Share a new fire, smoke, or hazard report with emergency teams.
          </Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Text style={styles.cardTitle}>Broadcast Messages</Text>
          <Text style={styles.cardText}>
            Read important public safety messages and update instructions.
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#09121F',
    minHeight: '100%',
  },
  heroCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  eyebrow: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#D92D20',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: '#0F1D31',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardText: {
    color: '#AAB8C5',
    fontSize: 14,
    lineHeight: 20,
  },
});