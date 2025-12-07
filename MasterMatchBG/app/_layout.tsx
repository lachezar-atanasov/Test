import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useAuthStore } from '../stores/authStore';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth protection hook
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, session, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inClientGroup = segments[0] === '(client)';
    const inMasterGroup = segments[0] === '(master)';

    if (!session) {
      // Not signed in -> redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (user) {
      // Signed in
      if (!user.role) {
        // No role selected -> go to role selection
        if (segments[1] !== 'role-select') {
          router.replace('/(auth)/role-select');
        }
      } else if (user.role === 'client') {
        // Client user - redirect away from auth and master screens
        if (inAuthGroup || inMasterGroup) {
          router.replace('/(client)');
        }
      } else if (user.role === 'master') {
        // Master user - redirect away from auth and client screens
        if (inAuthGroup || inClientGroup) {
          router.replace('/(master)');
        }
      }
    }
  }, [session, user, isInitialized, segments]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(master)" />
    </Stack>
  );
}
