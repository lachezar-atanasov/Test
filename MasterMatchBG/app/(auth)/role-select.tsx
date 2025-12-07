import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  description,
  icon,
  features,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`border-2 rounded-2xl p-5 mb-4 ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 bg-white'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-3">
        <View
          className={`w-14 h-14 rounded-full items-center justify-center ${
            isSelected ? 'bg-primary-500' : 'bg-gray-100'
          }`}
        >
          <Ionicons
            name={icon}
            size={28}
            color={isSelected ? '#fff' : '#6b7280'}
          />
        </View>
        <View className="ml-4 flex-1">
          <Text
            className={`text-xl font-bold ${
              isSelected ? 'text-primary-700' : 'text-gray-800'
            }`}
          >
            {title}
          </Text>
          <Text className="text-gray-500 text-sm">{description}</Text>
        </View>
        {isSelected && (
          <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </View>
      
      <View className="mt-2 pl-2">
        {features.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={isSelected ? '#2563eb' : '#9ca3af'}
            />
            <Text
              className={`ml-2 text-sm ${
                isSelected ? 'text-gray-700' : 'text-gray-500'
              }`}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { setUserRole, isLoading, user } = useAuthStore();

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Select a Role', 'Please choose how you want to use MasterMatch BG');
      return;
    }

    const result = await setUserRole(selectedRole);
    
    if (result.success) {
      // Navigate based on role
      if (selectedRole === 'master') {
        router.replace('/(master)/profile-setup');
      } else {
        router.replace('/(client)');
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to set role. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 pt-10 pb-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            How will you use MasterMatch?
          </Text>
          <Text className="text-gray-500">
            Choose your role. You can change this later in settings.
          </Text>
        </View>

        {/* Role Cards */}
        <RoleCard
          role="client"
          title="I Need a Handyman"
          description="Post jobs and hire professionals"
          icon="home-outline"
          features={[
            'Post repair and maintenance jobs',
            'Receive offers from verified masters',
            'Chat directly with professionals',
            'Leave reviews after completion',
          ]}
          isSelected={selectedRole === 'client'}
          onSelect={() => setSelectedRole('client')}
        />

        <RoleCard
          role="master"
          title="I'm a Handyman"
          description="Find jobs and grow your business"
          icon="construct-outline"
          features={[
            'Browse available jobs in your area',
            'Send offers to potential clients',
            'Build your reputation with reviews',
            'Manage your services and pricing',
          ]}
          isSelected={selectedRole === 'master'}
          onSelect={() => setSelectedRole('master')}
        />

        {/* Continue Button */}
        <View className="mt-auto">
          <Button
            title="Continue"
            onPress={handleContinue}
            isLoading={isLoading}
            disabled={!selectedRole}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
