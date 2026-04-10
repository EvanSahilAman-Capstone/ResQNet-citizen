import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { Auth0Provider } from 'react-native-auth0';

import SplashIntroScreen from './src/screens/SplashIntroScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen';
import MapScreen from './src/screens/MapScreen';
import UploadScreen from './src/screens/UploadScreen';

import { auth0 } from './src/services/api';

export type RootStackParamList = {
  SplashIntro: undefined;
  Login: undefined;
  Home: undefined;
  Alerts: undefined;
  AlertDetails: {
    alert: {
      _id?: string;
      id?: string;
      message?: string;
      priority?: string;
      radius?: number;
      coordinates?: [number, number];
      description?: string;
      timestamp?: string;
      status?: string;
    };
  };
  Map: undefined;
  Upload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#081120' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: '#09121F' },
      }}
    >
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen
            {...props}
            onLoginSuccess={onLoginSuccess}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="SplashIntro"
      screenOptions={{
        headerStyle: { backgroundColor: '#081120' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: '#09121F' },
      }}
    >
      <Stack.Screen
        name="SplashIntro"
        component={SplashIntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'ResQNet Citizen', headerLeft: () => null }}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: 'Active Alerts' }}
      />
      <Stack.Screen
        name="AlertDetails"
        component={AlertDetailsScreen}
        options={{ title: 'Alert Details' }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Safety Map' }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: 'Report a Wildfire' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        const ok = await auth0.credentialsManager.hasValidCredentials();
        setLoggedIn(ok);
      } catch (err) {
        console.log('Auth check failed:', err);
        setLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    boot();
  }, []);

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#09121F',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {loggedIn ? (
        <AppStack />
      ) : (
        <AuthStack onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Auth0Provider
      domain="resqnet.ca.auth0.com"
      clientId="GmO0r2OeT2XLpWM4dxbu1vDuyNimkHdi"
    >
      <AppNavigator />
    </Auth0Provider>
  );
}