import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../../components/ui';
import { JobRequest, Offer } from '../../types';
import { getCategoryIcon, JOB_STATUS_CONFIG } from '../../constants/categories';

// Mock data
const MOCK_OFFERS: (Offer & { job: JobRequest })[] = [
  {
    id: 'offer1',
    job_id: 'job1',
    master_id: 'master1',
    message: 'I can fix this for you. I have 5 years of experience.',
    proposed_price: 80,
    status: 'pending',
    created_at: new Date().toISOString(),
    job: {
      id: 'job1',
      client_id: 'client1',
      title: 'Fix bathroom faucet',
      description: 'The faucet is leaking',
      category: 'plumbing',
      budget_min: 50,
      budget_max: 100,
      city: 'Sofia',
      district: 'Mladost 1',
      status: 'open',
      image_urls: [],
      assigned_master_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'offer2',
    job_id: 'job2',
    master_id: 'master1',
    message: 'Available this weekend for the job.',
    proposed_price: 200,
    status: 'accepted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    job: {
      id: 'job2',
      client_id: 'client2',
      title: 'Paint kitchen walls',
      description: 'Need to repaint the kitchen',
      category: 'painting',
      budget_min: 150,
      budget_max: 300,
      city: 'Sofia',
      district: 'Center',
      status: 'assigned',
      image_urls: [],
      assigned_master_id: 'master1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

const MOCK_COMPLETED_JOBS: JobRequest[] = [
  {
    id: 'completed1',
    client_id: 'client3',
    title: 'Install ceiling fan',
    description: 'Installed ceiling fan in bedroom',
    category: 'electrical',
    budget_min: 80,
    budget_max: 150,
    city: 'Sofia',
    district: 'Lozenets',
    status: 'completed',
    image_urls: [],
    assigned_master_id: 'master1',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type TabType = 'offers' | 'active' | 'completed';

export default function MyWorkScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('offers');
  const [refreshing, setRefreshing] = useState(false);

  const pendingOffers = MOCK_OFFERS.filter((o) => o.status === 'pending');
  const activeJobs = MOCK_OFFERS.filter((o) => o.status === 'accepted');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderOfferCard = (offer: Offer & { job: JobRequest }) => {
    const statusLabel = offer.status === 'pending' ? 'Pending' : 
                        offer.status === 'accepted' ? 'Accepted' : 'Rejected';
    const statusVariant = offer.status === 'pending' ? 'warning' : 
                          offer.status === 'accepted' ? 'success' : 'error';

    return (
      <TouchableOpacity key={offer.id} activeOpacity={0.7}>
        <Card className="mb-3">
          <View className="flex-row items-start">
            <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
              <Text className="text-2xl">{getCategoryIcon(offer.job.category)}</Text>
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 font-semibold flex-1" numberOfLines={1}>
                  {offer.job.title}
                </Text>
                <Badge label={statusLabel} variant={statusVariant} />
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text className="text-gray-500 text-sm ml-1">{offer.job.district}</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-600 text-sm">
                  Your offer: <Text className="font-semibold">{offer.proposed_price} лв</Text>
                </Text>
                <Text className="text-gray-400 text-xs">
                  {new Date(offer.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderCompletedCard = (job: JobRequest) => (
    <TouchableOpacity key={job.id} activeOpacity={0.7}>
      <Card className="mb-3">
        <View className="flex-row items-start">
          <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
            <Text className="text-2xl">{getCategoryIcon(job.category)}</Text>
          </View>
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-800 font-semibold flex-1" numberOfLines={1}>
                {job.title}
              </Text>
              <Badge label="Completed" variant="success" />
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">{job.district}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">
                Completed {new Date(job.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Tabs */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row px-4 pt-2">
          {[
            { key: 'offers', label: 'My Offers', count: pendingOffers.length },
            { key: 'active', label: 'Active Jobs', count: activeJobs.length },
            { key: 'completed', label: 'Completed', count: MOCK_COMPLETED_JOBS.length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key
                  ? 'border-primary-600'
                  : 'border-transparent'
              }`}
            >
              <View className="flex-row items-center">
                <Text
                  className={`font-medium ${
                    activeTab === tab.key ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    className={`ml-1 px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-primary-100' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        activeTab === tab.key ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'offers' && (
          <>
            {pendingOffers.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="document-text-outline" size={40} color="#9ca3af" />
                </View>
                <Text className="text-gray-800 font-semibold text-lg">No pending offers</Text>
                <Text className="text-gray-500 text-center mt-2 px-10">
                  Browse available jobs and send offers to get started
                </Text>
              </View>
            ) : (
              pendingOffers.map(renderOfferCard)
            )}
          </>
        )}

        {activeTab === 'active' && (
          <>
            {activeJobs.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="briefcase-outline" size={40} color="#9ca3af" />
                </View>
                <Text className="text-gray-800 font-semibold text-lg">No active jobs</Text>
                <Text className="text-gray-500 text-center mt-2 px-10">
                  Jobs you're working on will appear here
                </Text>
              </View>
            ) : (
              activeJobs.map(renderOfferCard)
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {MOCK_COMPLETED_JOBS.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle-outline" size={40} color="#9ca3af" />
                </View>
                <Text className="text-gray-800 font-semibold text-lg">No completed jobs</Text>
                <Text className="text-gray-500 text-center mt-2 px-10">
                  Completed jobs will be shown here
                </Text>
              </View>
            ) : (
              MOCK_COMPLETED_JOBS.map(renderCompletedCard)
            )}
          </>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
