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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  function handleAttachPhoto() {
    Alert.alert(
      'Attach Photo',
      'Choose how you want to attach a wildfire image.',
      [
        {
          text: 'Camera',
          onPress: () => setSelectedPhoto('camera-photo.jpg'),
        },
        {
          text: 'Gallery',
          onPress: () => setSelectedPhoto('gallery-photo.jpg'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  function handleSubmit() {
    Alert.alert(
      'Report saved',
      'This polished report page is ready. Next we connect it to backend upload and storage.'
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topCard}>
        <Text style={styles.eyebrow}>Wildfire Reporting</Text>
        <Text style={styles.title}>Report a Wildfire</Text>
        <Text style={styles.subtitle}>
          Help responders by sharing fire sightings, smoke zones, or dangerous conditions.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Report title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Example: Visible smoke near residential street"
          placeholderTextColor="#7C8DA1"
          style={styles.input}
        />

        <Text style={styles.label}>Details</Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="Describe the wildfire, smoke, nearby roads, or current danger..."
          placeholderTextColor="#7C8DA1"
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
        />

        <Pressable style={styles.attachButton} onPress={handleAttachPhoto}>
          <Text style={styles.attachButtonText}>Attach Photo</Text>
        </Pressable>

        {selectedPhoto ? (
          <View style={styles.fileBox}>
            <Text style={styles.fileLabel}>Selected file</Text>
            <Text style={styles.fileName}>{selectedPhoto}</Text>
          </View>
        ) : null}

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Wildfire Report</Text>
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
  topCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
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
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#B8C6D5',
    lineHeight: 22,
    fontSize: 15,
  },
  formCard: {
    backgroundColor: '#0F1D31',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    color: '#E5EEF8',
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#13253B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 130,
  },
  attachButton: {
    backgroundColor: '#16304A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  attachButtonText: {
    color: '#7CC4FF',
    fontWeight: '800',
    fontSize: 15,
  },
  fileBox: {
    backgroundColor: '#13253B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  fileLabel: {
    color: '#8FA8C1',
    fontSize: 12,
    marginBottom: 4,
  },
  fileName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#D92D20',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});