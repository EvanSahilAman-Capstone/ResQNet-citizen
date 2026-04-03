import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

export default function AlertDetailsScreen({ route, navigation }: any) {
  const { alert } = route.params;

  function priorityColor(priority: string) {
    const value = priority.toLowerCase();
    if (value === 'urgent') return '#D92D20';
    if (value === 'high') return '#F79009';
    return '#2563EB';
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={[
          styles.priorityBadge,
          { backgroundColor: priorityColor(alert.priority || 'medium') },
        ]}
      >
        <Text style={styles.priorityText}>{alert.priority}</Text>
      </View>

      <Text style={styles.title}>{alert.message}</Text>
      <Text style={styles.timestamp}>{alert.timestamp}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{alert.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coverage</Text>
        <Text style={styles.sectionText}>Radius: {alert.radius} km</Text>
        <Text style={styles.sectionText}>Status: {alert.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Guidance</Text>
        <Text style={styles.sectionText}>
          Stay alert, monitor official instructions, and prepare to follow route guidance if evacuation is announced.
        </Text>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.primaryButtonText}>Open Safety Map</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  priorityText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#101828',
    marginBottom: 8,
  },
  timestamp: {
    color: '#667085',
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 8,
  },
  sectionText: {
    color: '#475467',
    lineHeight: 22,
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#D92D20',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});