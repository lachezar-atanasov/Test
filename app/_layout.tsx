import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ProtectedRoute>
    </AuthProvider>
  );
}
