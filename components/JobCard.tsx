import { View, Text, TouchableOpacity, Image } from 'react-native';
import { JobRequest } from '../types/database';
import { router } from 'expo-router';

interface JobCardProps {
  job: JobRequest;
}

export function JobCard({ job }: JobCardProps) {
  const getStatusColor = (status: JobRequest['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/jobs/${job.id}`)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1" numberOfLines={2}>
          {job.title}
        </Text>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
          <Text className="text-xs font-semibold capitalize">{job.status}</Text>
        </View>
      </View>

      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
        {job.description}
      </Text>

      <View className="flex-row items-center gap-4 mt-2">
        <Text className="text-gray-500 text-sm">📍 {job.district}</Text>
        {(job.budget_min || job.budget_max) && (
          <Text className="text-gray-500 text-sm">
            💰 {job.budget_min && job.budget_max
              ? `${job.budget_min} - ${job.budget_max} BGN`
              : job.budget_min
              ? `From ${job.budget_min} BGN`
              : `Up to ${job.budget_max} BGN`}
          </Text>
        )}
      </View>

      {job.images && job.images.length > 0 && (
        <View className="flex-row gap-2 mt-3">
          {job.images.slice(0, 3).map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-16 h-16 rounded"
            />
          ))}
          {job.images.length > 3 && (
            <View className="w-16 h-16 rounded bg-gray-200 items-center justify-center">
              <Text className="text-gray-600 text-xs">+{job.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <Text className="text-gray-400 text-xs mt-2">
        {new Date(job.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}
