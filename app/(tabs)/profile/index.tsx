import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/Button';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Email</Text>
          <Text className="text-lg text-gray-900">{user?.email}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Full Name</Text>
          <Text className="text-lg text-gray-900">{profile?.full_name || 'Not set'}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Role</Text>
          <Text className="text-lg text-gray-900 capitalize">{profile?.role || 'Not set'}</Text>
        </View>

        {profile?.role === 'master' && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/master-setup')}
            className="bg-blue-500 rounded-lg px-6 py-4 items-center mb-4"
          >
            <Text className="text-white font-semibold">Setup Master Profile</Text>
          </TouchableOpacity>
        )}

        <Button
          title="Sign Out"
          onPress={signOut}
          variant="outline"
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
