import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isInitialized } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="job/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Job Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="chat/[jobId]"
            options={{
              headerShown: true,
              headerTitle: 'Chat',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="master/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Master Profile',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
