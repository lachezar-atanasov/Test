import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { lightTheme, darkTheme } from '../src/theme';
import { useAuthStore, useSettingsStore } from '../src/store';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const systemColorScheme = useColorScheme();
  const colorScheme = useSettingsStore(state => state.colorScheme);
  const initialize = useAuthStore(state => state.initialize);

  // Determine actual theme based on settings and system
  const effectiveColorScheme =
    colorScheme === 'system' ? systemColorScheme || 'light' : colorScheme;
  const theme = effectiveColorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize auth state
        await initialize();
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [initialize]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
