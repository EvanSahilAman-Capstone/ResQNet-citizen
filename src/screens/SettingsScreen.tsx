import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  function handleSubmit() {
    Alert.alert(
      'Saved locally',
      'This polished upload screen is ready. Backend/S3 connection comes next.'
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Report a Hazard</Text>
        <Text style={styles.subtitle}>
          Share wildfire-related hazards, blocked roads, smoke zones, or emergency concerns.
        </Text>

        <Text style={styles.label}>Hazard title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Example: Smoke near residential zone"
          placeholderTextColor="#98A2B3"
          style={styles.input}
        />

        <Text style={styles.label}>Details</Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Describe what you see..."
          placeholderTextColor="#98A2B3"
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
        />

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Attach Photo</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Report</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#101828',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475467',
    lineHeight: 22,
    marginBottom: 18,
  },
  label: {
    fontWeight: '700',
    color: '#344054',
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#101828',
  },
  textArea: {
    minHeight: 120,
  },
  secondaryButton: {
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: '#D92D20',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});