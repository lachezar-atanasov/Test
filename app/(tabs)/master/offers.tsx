import { useState, useCallback } from 'react';
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
import { getMasterOffers } from '@/services/offers';
import { getMasterJobs } from '@/services/jobs';
import { Offer, JobRequest, OfferStatus } from '@/types';
import { PressableCard, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/types';
import { JOB_STATUS_LABELS, OFFER_STATUS_LABELS } from '@/config/constants';

type Tab = 'offers' | 'jobs';

const OFFER_STATUS_FILTERS: { label: string; value: OfferStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

export default function MasterOffersScreen() {
  const { masterProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('offers');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'all'>('all');

  const fetchData = async (showLoading = true) => {
    if (!masterProfile) return;
    
    if (showLoading) setIsLoading(true);
    try {
      if (activeTab === 'offers') {
        const data = await getMasterOffers(
          masterProfile.id,
          statusFilter === 'all' ? undefined : statusFilter
        );
        setOffers(data);
      } else {
        const data = await getMasterJobs(masterProfile.id);
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [masterProfile, activeTab, statusFilter])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData(false);
  };

  const getOfferStatusBadgeVariant = (status: OfferStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const getJobStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <PressableCard
      variant="outlined"
      className="mb-3"
      onPress={() => router.push(`/job/${item.job_id}`)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-secondary-900 flex-1 mr-2" numberOfLines={1}>
          {item.job?.title || 'Job'}
        </Text>
        <Badge
          label={OFFER_STATUS_LABELS[item.status]}
          variant={getOfferStatusBadgeVariant(item.status)}
          size="sm"
        />
      </View>

      {item.job && (
        <View className="flex-row items-center mb-2">
          <Ionicons name="construct-outline" size={14} color="#64748b" />
          <Text className="text-secondary-600 text-sm ml-1">
            {getCategoryLabel(item.job.category)}
          </Text>
          <View className="mx-2 w-1 h-1 rounded-full bg-secondary-400" />
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text className="text-secondary-600 text-sm ml-1">{item.job.district}</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-secondary-100">
        <View>
          <Text className="text-xs text-secondary-500">Your Offer</Text>
          <Text className="text-lg font-bold text-primary-600">{item.price} BGN</Text>
        </View>
        {item.estimated_duration && (
          <View>
            <Text className="text-xs text-secondary-500">Duration</Text>
            <Text className="text-secondary-700 font-medium">{item.estimated_duration}</Text>
          </View>
        )}
        <View>
          <Text className="text-xs text-secondary-500">Sent</Text>
          <Text className="text-secondary-700">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </PressableCard>
  );

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
          variant={getJobStatusBadgeVariant(item.status)}
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

      {item.client && (
        <View className="flex-row items-center mt-2 pt-2 border-t border-secondary-100">
          <Ionicons name="person-outline" size={14} color="#64748b" />
          <Text className="text-secondary-600 text-sm ml-1">
            Client: {item.client.full_name}
          </Text>
        </View>
      )}
    </PressableCard>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-secondary-900">My Work</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-l-xl ${
            activeTab === 'offers' ? 'bg-primary-600' : 'bg-white border border-secondary-200'
          }`}
          onPress={() => setActiveTab('offers')}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'offers' ? 'text-white' : 'text-secondary-600'
            }`}
          >
            My Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-r-xl ${
            activeTab === 'jobs' ? 'bg-primary-600' : 'bg-white border border-secondary-200'
          }`}
          onPress={() => setActiveTab('jobs')}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'jobs' ? 'text-white' : 'text-secondary-600'
            }`}
          >
            Assigned Jobs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter for Offers */}
      {activeTab === 'offers' && (
        <View className="px-4 pb-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={OFFER_STATUS_FILTERS}
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
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : activeTab === 'offers' ? (
        offers.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No Offers Yet"
            description="You haven't sent any offers yet. Browse available jobs and send your first offer!"
            actionLabel="Browse Jobs"
            onAction={() => router.push('/(tabs)/master')}
          />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item.id}
            renderItem={renderOffer}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          />
        )
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No Assigned Jobs"
          description="You don't have any assigned jobs yet. Keep sending offers to get hired!"
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
