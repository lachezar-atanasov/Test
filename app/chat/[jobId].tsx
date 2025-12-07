import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getChatMessages, sendMessage, subscribeToChat, unsubscribeFromChat } from '@/services/chat';
import { getJobById } from '@/services/jobs';
import { ChatMessage, JobRequest } from '@/types';
import { Avatar, LoadingSpinner } from '@/components/ui';

export default function ChatScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<JobRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!jobId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [jobData, messagesData] = await Promise.all([
          getJobById(jobId),
          getChatMessages(jobId),
        ]);
        setJob(jobData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const channel = subscribeToChat(jobId, (newMsg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribeFromChat(channel);
    };
  }, [jobId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !jobId || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const sent = await sendMessage(jobId, user.id, messageText);
      // Only add if not already added by real-time subscription
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipantName = () => {
    if (!job || !user) return 'Chat';
    if (user.role === 'client' && job.assigned_master?.user) {
      return job.assigned_master.user.full_name;
    }
    if (user.role === 'master' && job.client) {
      return job.client.full_name;
    }
    return 'Chat';
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.sender_id === user?.id;

    return (
      <View
        className={`flex-row mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwnMessage && (
          <Avatar
            source={item.sender?.avatar_url}
            name={item.sender?.full_name}
            size="sm"
            className="mr-2"
          />
        )}
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? 'bg-primary-600 rounded-br-sm'
              : 'bg-white border border-secondary-200 rounded-bl-sm'
          }`}
        >
          <Text
            className={isOwnMessage ? 'text-white' : 'text-secondary-800'}
          >
            {item.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-primary-200' : 'text-secondary-400'
            }`}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: getOtherParticipantName(),
          headerShown: true,
        }}
      />
      <SafeAreaView className="flex-1 bg-secondary-50" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={90}
        >
          {/* Job Info Banner */}
          <View className="bg-white border-b border-secondary-200 px-4 py-3">
            <Text className="text-sm text-secondary-500">Regarding:</Text>
            <Text className="text-secondary-900 font-medium" numberOfLines={1}>
              {job?.title}
            </Text>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-8">
                <Ionicons name="chatbubbles-outline" size={48} color="#94a3b8" />
                <Text className="text-secondary-500 mt-2">No messages yet</Text>
                <Text className="text-secondary-400 text-sm">
                  Start the conversation!
                </Text>
              </View>
            }
          />

          {/* Input */}
          <View className="bg-white border-t border-secondary-200 px-4 py-3">
            <View className="flex-row items-end">
              <View className="flex-1 bg-secondary-100 rounded-2xl px-4 py-2 mr-3">
                <TextInput
                  className="text-secondary-900 max-h-24"
                  placeholder="Type a message..."
                  placeholderTextColor="#94a3b8"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
              </View>
              <TouchableOpacity
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  newMessage.trim() && !isSending
                    ? 'bg-primary-600'
                    : 'bg-secondary-200'
                }`}
                onPress={handleSend}
                disabled={!newMessage.trim() || isSending}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={newMessage.trim() && !isSending ? '#fff' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
