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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  fetchMe,
  getReportUploadUrl,
  uploadImageToS3,
  submitFireReport,
} from '../services/api';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    uri: string;
    type?: string;
    fileName?: string;
  } | null>(null);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [loading, setLoading] = useState(false);

  function handleAttachPhoto() {
    Alert.alert('Attach Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo' });

          if (result.assets && result.assets.length > 0) {
            const photo = result.assets[0];

            if (photo.uri) {
              setSelectedPhoto({
                uri: photo.uri,
                type: photo.type,
                fileName: photo.fileName,
              });
            }
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo' });

          if (result.assets && result.assets.length > 0) {
            const photo = result.assets[0];

            if (photo.uri) {
              setSelectedPhoto({
                uri: photo.uri,
                type: photo.type,
                fileName: photo.fileName,
              });
            }
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }

  async function handleSubmit() {
    try {
      if (!title.trim()) {
        Alert.alert('Missing title', 'Please enter a report title.');
        return;
      }

      if (!details.trim()) {
        Alert.alert('Missing details', 'Please enter report details.');
        return;
      }

      if (!selectedPhoto) {
        Alert.alert('Missing photo', 'Please attach a wildfire photo.');
        return;
      }

      setLoading(true);

      const me = await fetchMe();
      const reportId = `report-${Date.now()}`;
      const hazardType = 'wildfire';

      const uploadData = await getReportUploadUrl(reportId, hazardType);

      await uploadImageToS3(
        uploadData.upload_url,
        uploadData.form_fields,
        selectedPhoto
      );

      const payload = {
        report_id: reportId,
        photo_links: [uploadData.final_photo_url],
        hazard_type: hazardType,
        uploading_user: me?.sub || me?.user_id || me?.email || 'unknown-user',
        coordinates: [43.589, -79.644],
        severity,
        description: `${title.trim()} - ${details.trim()}`,
      };

      await submitFireReport(payload);

      Alert.alert('Success', 'Wildfire report submitted successfully.');

      setTitle('');
      setDetails('');
      setSelectedPhoto(null);
      setSeverity('medium');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit wildfire report.');
    } finally {
      setLoading(false);
    }
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

        <Text style={styles.label}>Severity</Text>
        <View style={styles.severityRow}>
          {(['low', 'medium', 'high', 'critical'] as const).map(level => (
            <Pressable
              key={level}
              style={[
                styles.severityButton,
                severity === level && styles.severityButtonActive,
              ]}
              onPress={() => setSeverity(level)}
            >
              <Text
                style={[
                  styles.severityButtonText,
                  severity === level && styles.severityButtonTextActive,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.attachButton} onPress={handleAttachPhoto}>
          <Text style={styles.attachButtonText}>Attach Photo</Text>
        </Pressable>

        {selectedPhoto ? (
          <View style={styles.fileBox}>
            <Text style={styles.fileLabel}>Selected file</Text>
            <Text style={styles.fileName}>
              {selectedPhoto.fileName || selectedPhoto.uri}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Wildfire Report'}
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
  severityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  severityButton: {
    backgroundColor: '#13253B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  severityButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  severityButtonText: {
    color: '#B8C6D5',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  severityButtonTextActive: {
    color: '#FFFFFF',
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