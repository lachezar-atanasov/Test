import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { JOB_CATEGORIES, SOFIA_DISTRICTS } from '../../constants/categories';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 border-b border-gray-100"
    activeOpacity={0.7}
  >
    <View
      className={`w-10 h-10 rounded-full items-center justify-center ${
        danger ? 'bg-red-100' : 'bg-gray-100'
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? '#ef4444' : '#6b7280'}
      />
    </View>
    <View className="flex-1 ml-3">
      <Text className={`font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>
        {title}
      </Text>
      {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    )}
  </TouchableOpacity>
);

// Mock master profile data
const MOCK_MASTER_PROFILE = {
  bio: 'Professional plumber and electrician with 8 years of experience.',
  categories: ['plumbing', 'electrical'] as const,
  districts: ['Mladost 1', 'Mladost 2', 'Center'] as const,
  base_price_min: 50,
  base_price_max: 150,
  years_experience: 8,
  average_rating: 4.8,
  total_reviews: 23,
};

export default function MasterProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-primary-600 font-bold text-3xl">
                {user?.name?.charAt(0) || 'M'}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-gray-800 font-bold text-xl">
                {user?.name || 'Master'}
              </Text>
              <Text className="text-gray-500">{user?.email}</Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text className="text-gray-800 font-semibold ml-1">
                  {MOCK_MASTER_PROFILE.average_rating}
                </Text>
                <Text className="text-gray-500 text-sm ml-1">
                  ({MOCK_MASTER_PROFILE.total_reviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 p-4 bg-gray-50 rounded-xl">
            <Text className="text-gray-600">{MOCK_MASTER_PROFILE.bio}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-800">
              {MOCK_MASTER_PROFILE.total_reviews}
            </Text>
            <Text className="text-gray-500 text-sm">Jobs Done</Text>
          </View>
          <View className="flex-1 items-center border-l border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              {MOCK_MASTER_PROFILE.years_experience}
            </Text>
            <Text className="text-gray-500 text-sm">Years Exp.</Text>
          </View>
          <View className="flex-1 items-center border-l border-gray-200">
            <Text className="text-2xl font-bold text-primary-600">
              {MOCK_MASTER_PROFILE.base_price_min}-{MOCK_MASTER_PROFILE.base_price_max}
            </Text>
            <Text className="text-gray-500 text-sm">BGN/job</Text>
          </View>
        </View>

        {/* Services */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">My Services</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm">Edit</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {MOCK_MASTER_PROFILE.categories.map((cat) => {
              const category = JOB_CATEGORIES.find((c) => c.value === cat);
              return (
                <View
                  key={cat}
                  className="flex-row items-center bg-primary-50 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="mr-1">{category?.icon}</Text>
                  <Text className="text-primary-700 font-medium">
                    {category?.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Service Areas */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">Service Areas</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm">Edit</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {MOCK_MASTER_PROFILE.districts.map((district) => (
              <View
                key={district}
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2"
              >
                <Ionicons name="location" size={14} color="#6b7280" />
                <Text className="text-gray-700 font-medium ml-1">{district}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 font-medium text-sm mb-2 uppercase">
            Account
          </Text>
          <Card>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update bio, services, areas"
              onPress={() => router.push('/(master)/profile-setup')}
            />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage push notifications"
              onPress={() => console.log('Notifications')}
            />
            <MenuItem
              icon="star-outline"
              title="My Reviews"
              subtitle="View client feedback"
              onPress={() => console.log('Reviews')}
            />
          </Card>
        </View>

        {/* Support */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 font-medium text-sm mb-2 uppercase">
            Support
          </Text>
          <Card>
            <MenuItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => console.log('Help')}
            />
            <MenuItem
              icon="chatbox-outline"
              title="Contact Support"
              onPress={() => console.log('Support')}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-6">
          <Card>
            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              danger
            />
          </Card>
        </View>

        <Text className="text-center text-gray-400 text-sm mt-6">
          MasterMatch BG v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
