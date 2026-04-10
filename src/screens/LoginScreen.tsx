import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';

type Props = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  const { authorize } = useAuth0();
  const [loading, setLoading] = useState(false);

  const authParams = {
    audience: 'https://resqnet-api',
    scope:
      'openid profile email offline_access read:broadcasts write:reports read:fires write:fires read:safezones',
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);

      await authorize(authParams);

      onLoginSuccess();
    } catch (error: any) {
      if (String(error?.message || '').toLowerCase().includes('cancel')) {
        return;
      }
      Alert.alert('Login failed', error?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);

      await authorize({
        ...authParams,
        additionalParameters: {
          screen_hint: 'signup',
        },
      });

      onLoginSuccess();
    } catch (error: any) {
      if (String(error?.message || '').toLowerCase().includes('cancel')) {
        return;
      }
      Alert.alert('Signup failed', error?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ResQNet Citizen</Text>
      <Text style={styles.subtitle}>
        Log in or create an account to view alerts, maps, and submit fire reports
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleCreateAccount}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09121F',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#D92D20',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#93C5FD',
    fontSize: 15,
    fontWeight: '700',
  },
});