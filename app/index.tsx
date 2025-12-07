import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/(auth)/login');
    } else if (!profile?.role) {
      router.replace('/(auth)/role-select');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, profile, loading]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
