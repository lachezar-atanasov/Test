import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getClientJobs } from '@/services/jobs';
import { JobRequest, JobStatus } from '@/types';
import { PressableCard, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/types';
import { JOB_STATUS_LABELS } from '@/config/constants';

const STATUS_FILTERS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Completed', value: 'completed' },
];

export default function ClientJobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const fetchJobs = async (showLoading = true) => {
    if (!user) return;
    
    if (showLoading) setIsLoading(true);
    try {
      const data = await getClientJobs(
        user.id,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [user, statusFilter])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchJobs(false);
  };

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'assigned':
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  const renderJob = ({ item }: { item: JobRequest }) => (
    <PressableCard
      variant="outlined"
      className="mb-3"
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-secondary-900 flex-1 mr-2" numberOfLines={1}>
          {item.title}
        </Text>
        <Badge
          label={JOB_STATUS_LABELS[item.status]}
          variant={getStatusBadgeVariant(item.status)}
          size="sm"
        />
      </View>
      
      <View className="flex-row items-center mb-2">
        <Ionicons name="construct-outline" size={14} color="#64748b" />
        <Text className="text-secondary-600 text-sm ml-1">
          {getCategoryLabel(item.category)}
        </Text>
        <View className="mx-2 w-1 h-1 rounded-full bg-secondary-400" />
        <Ionicons name="location-outline" size={14} color="#64748b" />
        <Text className="text-secondary-600 text-sm ml-1">{item.district}</Text>
      </View>

      <Text className="text-secondary-500 text-sm" numberOfLines={2}>
        {item.description}
      </Text>

      {item.status === 'open' && item.offers_count !== undefined && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-secondary-100">
          <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
          <Text className="text-primary-600 font-medium ml-1">
            {item.offers_count} {item.offers_count === 1 ? 'offer' : 'offers'}
          </Text>
        </View>
      )}
    </PressableCard>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-secondary-900">My Jobs</Text>
      </View>

      {/* Status Filter */}
      <View className="px-4 pb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                statusFilter === item.value
                  ? 'bg-primary-600'
                  : 'bg-white border border-secondary-200'
              }`}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                className={`font-medium ${
                  statusFilter === item.value ? 'text-white' : 'text-secondary-600'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No Jobs Found"
          description={
            statusFilter === 'all'
              ? "You haven't posted any jobs yet. Create your first job request!"
              : `You don't have any ${statusFilter} jobs.`
          }
          actionLabel={statusFilter === 'all' ? 'Post a Job' : undefined}
          onAction={statusFilter === 'all' ? () => router.push('/(tabs)/client/create') : undefined}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
