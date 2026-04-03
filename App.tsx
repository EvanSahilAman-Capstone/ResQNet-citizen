import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashIntroScreen from './src/screens/SplashIntroScreen';
import HomeScreen from './src/screens/HomeScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen';
import MapScreen from './src/screens/MapScreen';
import UploadScreen from './src/screens/UploadScreen';

export type RootStackParamList = {
  SplashIntro: undefined;
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

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}