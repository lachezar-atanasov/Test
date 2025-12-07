import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { JOB_CATEGORIES } from '../../constants/categories';

export default function ClientHomeScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="bg-primary-600 px-6 py-8 rounded-b-3xl">
          <Text className="text-white text-lg">Welcome back,</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {user?.name || 'Guest'} 👋
          </Text>
          <Text className="text-primary-100 mt-2">
            What do you need help with today?
          </Text>
        </View>

        {/* Quick Action */}
        <View className="px-6 -mt-6">
          <Card variant="elevated" padding="lg">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-gray-800 font-bold text-lg">
                  Need a repair?
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Post a job and get offers from trusted masters
                </Text>
              </View>
              <Button
                title="Post Job"
                size="sm"
                fullWidth={false}
                onPress={() => router.push('/(client)/create-job')}
              />
            </View>
          </Card>
        </View>

        {/* Categories */}
        <View className="px-6 mt-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">
            Browse by Category
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {JOB_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                className="w-[48%] bg-white rounded-xl p-4 mb-3 shadow-sm"
                activeOpacity={0.7}
                onPress={() => {
                  // Navigate to create job with pre-selected category
                  router.push({
                    pathname: '/(client)/create-job',
                    params: { category: category.value },
                  });
                }}
              >
                <Text className="text-3xl mb-2">{category.icon}</Text>
                <Text className="text-gray-800 font-semibold">
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* How it Works */}
        <View className="px-6 mt-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">
            How it Works
          </Text>
          <Card>
            <View className="flex-row items-start mb-4">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-primary-600 font-bold">1</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-semibold">Post a Job</Text>
                <Text className="text-gray-500 text-sm">
                  Describe what you need done
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start mb-4">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-primary-600 font-bold">2</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-semibold">Get Offers</Text>
                <Text className="text-gray-500 text-sm">
                  Receive offers from qualified masters
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-primary-600 font-bold">3</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-semibold">Hire & Review</Text>
                <Text className="text-gray-500 text-sm">
                  Choose a master and leave a review
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mt-6">
          <View className="flex-row">
            <View className="flex-1 bg-green-50 rounded-xl p-4 mr-2">
              <Ionicons name="people" size={24} color="#22c55e" />
              <Text className="text-2xl font-bold text-gray-800 mt-2">500+</Text>
              <Text className="text-gray-500 text-sm">Verified Masters</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-4 ml-2">
              <Ionicons name="star" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-800 mt-2">4.8</Text>
              <Text className="text-gray-500 text-sm">Average Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
