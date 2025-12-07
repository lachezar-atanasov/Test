import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../../components/ui';
import { JobRequest, JobStatus } from '../../types';
import { getCategoryIcon, getCategoryLabel, JOB_STATUS_CONFIG } from '../../constants/categories';

// Mock data for now
const MOCK_JOBS: JobRequest[] = [
  {
    id: '1',
    client_id: 'user1',
    title: 'Leak under the kitchen sink',
    description: 'Water is dripping from the pipe under the sink. Need urgent repair.',
    category: 'plumbing',
    budget_min: 50,
    budget_max: 100,
    city: 'Sofia',
    district: 'Lyulin 6',
    status: 'open',
    image_urls: [],
    assigned_master_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offers_count: 3,
  },
  {
    id: '2',
    client_id: 'user1',
    title: 'Paint living room walls',
    description: 'Need to repaint the walls in the living room. About 25 sqm total.',
    category: 'painting',
    budget_min: 200,
    budget_max: 350,
    city: 'Sofia',
    district: 'Mladost 1',
    status: 'assigned',
    image_urls: [],
    assigned_master_id: 'master1',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    offers_count: 5,
  },
  {
    id: '3',
    client_id: 'user1',
    title: 'Install new electrical outlets',
    description: 'Need 3 new outlets installed in the bedroom.',
    category: 'electrical',
    budget_min: 80,
    budget_max: 150,
    city: 'Sofia',
    district: 'Center',
    status: 'completed',
    image_urls: [],
    assigned_master_id: 'master2',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
    offers_count: 4,
  },
];

type TabType = 'all' | 'open' | 'assigned' | 'completed';

const StatusTabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

interface JobCardProps {
  job: JobRequest;
  onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const statusConfig = JOB_STATUS_CONFIG[job.status];
  const formattedDate = new Date(job.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
              <Badge
                label={statusConfig.label}
                variant={
                  job.status === 'open'
                    ? 'success'
                    : job.status === 'assigned'
                    ? 'info'
                    : job.status === 'completed'
                    ? 'default'
                    : 'error'
                }
              />
            </View>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
              {job.description}
            </Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">{job.district}</Text>
              <Text className="text-gray-300 mx-2">•</Text>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">{formattedDate}</Text>
              {job.offers_count !== undefined && job.offers_count > 0 && (
                <>
                  <Text className="text-gray-300 mx-2">•</Text>
                  <Ionicons name="document-text-outline" size={14} color="#9ca3af" />
                  <Text className="text-gray-400 text-xs ml-1">
                    {job.offers_count} offer{job.offers_count !== 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </View>
            {job.budget_min && job.budget_max && (
              <Text className="text-primary-600 font-semibold text-sm mt-2">
                {job.budget_min} - {job.budget_max} лв
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default function MyJobsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [jobs] = useState<JobRequest[]>(MOCK_JOBS);

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch jobs from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {StatusTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-4 py-2 mr-2 rounded-full ${
                activeTab === tab.key ? 'bg-primary-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredJobs.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="briefcase-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-semibold text-lg">No jobs yet</Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              {activeTab === 'all'
                ? "You haven't posted any jobs yet. Create your first job to find a master!"
                : `No ${activeTab} jobs at the moment`}
            </Text>
            {activeTab === 'all' && (
              <Button
                title="Post a Job"
                onPress={() => router.push('/(client)/create-job')}
                fullWidth={false}
                className="mt-4"
              />
            )}
          </View>
        ) : (
          <>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => {
                  // TODO: Navigate to job details
                  console.log('View job:', job.id);
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
