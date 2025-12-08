// ===================================
// Unbond - Trauma Bond Recovery Companion
// ===================================
// A mobile app to help users recover from trauma bonds
// and toxic relationships through education, tracking,
// and grounding tools.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
