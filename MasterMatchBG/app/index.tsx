import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const { user, session, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Not authenticated - go to login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // No role selected - go to role selection
  if (!user?.role) {
    return <Redirect href="/(auth)/role-select" />;
  }

  // Redirect based on role
  if (user.role === 'client') {
    return <Redirect href="/(client)" />;
  }

  if (user.role === 'master') {
    return <Redirect href="/(master)" />;
  }

  // Fallback
  return <Redirect href="/(auth)/login" />;
}
