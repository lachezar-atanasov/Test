import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui';

// Placeholder for chat conversations
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    masterName: 'Ivan Petrov',
    jobTitle: 'Leak under the kitchen sink',
    lastMessage: 'I can come tomorrow at 10am, does that work?',
    timestamp: '10:30 AM',
    unread: 2,
  },
  {
    id: '2',
    masterName: 'Georgi Dimitrov',
    jobTitle: 'Paint living room walls',
    lastMessage: "Great, I'll bring the paint samples",
    timestamp: 'Yesterday',
    unread: 0,
  },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {MOCK_CONVERSATIONS.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-semibold text-lg">No messages yet</Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              When you accept an offer from a master, you can chat with them here
            </Text>
          </View>
        ) : (
          MOCK_CONVERSATIONS.map((conversation) => (
            <TouchableOpacity key={conversation.id} activeOpacity={0.7}>
              <Card className="mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
                    <Text className="text-primary-600 font-bold text-lg">
                      {conversation.masterName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-800 font-semibold">
                        {conversation.masterName}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {conversation.timestamp}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs" numberOfLines={1}>
                      {conversation.jobTitle}
                    </Text>
                    <View className="flex-row items-center justify-between mt-1">
                      <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unread > 0 && (
                        <View className="bg-primary-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                          <Text className="text-white text-xs font-bold">
                            {conversation.unread}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
