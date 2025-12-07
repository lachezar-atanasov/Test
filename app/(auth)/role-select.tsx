import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/database';

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateProfile, profile } = useAuth();

  // If user already has a role, redirect
  if (profile?.role) {
    router.replace('/(tabs)');
    return null;
  }

  const handleSelectRole = async (role: UserRole) => {
    if (loading) return;

    setSelectedRole(role);
    setLoading(true);

    const { error } = await updateProfile({ role });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Could not update role. Please try again.');
      setSelectedRole(null);
    } else {
      // If master, we might want to create master_profile entry later
      // For now, just navigate to main app
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</Text>
        <Text className="text-gray-600 mb-8">
          Select how you want to use MasterMatch
        </Text>

        <View className="gap-4">
          <TouchableOpacity
            onPress={() => handleSelectRole('client')}
            disabled={loading}
            className={`border-2 rounded-xl p-6 ${
              selectedRole === 'client'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            } ${loading && 'opacity-50'}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-2">Client</Text>
                <Text className="text-gray-600">
                  Post job requests and find skilled masters to help you
                </Text>
              </View>
              {selectedRole === 'client' && loading && (
                <ActivityIndicator color="#3b82f6" className="ml-4" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectRole('master')}
            disabled={loading}
            className={`border-2 rounded-xl p-6 ${
              selectedRole === 'master'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            } ${loading && 'opacity-50'}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-2">Master</Text>
                <Text className="text-gray-600">
                  Browse available jobs and send offers to clients
                </Text>
              </View>
              {selectedRole === 'master' && loading && (
                <ActivityIndicator color="#3b82f6" className="ml-4" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-gray-500 mt-8 text-center">
          You can update your role later in settings
        </Text>
      </View>
    </ScrollView>
  );
}
