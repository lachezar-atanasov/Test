import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../../components/ui';
import { JobRequest, JobCategory, SofiaDistrict } from '../../types';
import {
  getCategoryIcon,
  getCategoryLabel,
  JOB_CATEGORIES,
  SOFIA_DISTRICTS,
} from '../../constants/categories';

// Mock available jobs
const MOCK_JOBS: JobRequest[] = [
  {
    id: '1',
    client_id: 'client1',
    title: 'Leak under the kitchen sink',
    description: 'Water is dripping from the pipe under the sink. Need urgent repair. The leak started 2 days ago.',
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
    client: {
      id: 'client1',
      email: 'client@example.com',
      role: 'client',
      name: 'Maria Ivanova',
      phone: null,
      city: 'Sofia',
      district: 'Lyulin 6',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    client_id: 'client2',
    title: 'Install new ceiling light fixtures',
    description: 'Need to install 3 new LED ceiling lights in the living room. Wiring is already in place.',
    category: 'electrical',
    budget_min: 80,
    budget_max: 150,
    city: 'Sofia',
    district: 'Mladost 1',
    status: 'open',
    image_urls: [],
    assigned_master_id: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client2',
      email: 'client2@example.com',
      role: 'client',
      name: 'Petar Georgiev',
      phone: null,
      city: 'Sofia',
      district: 'Mladost 1',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    client_id: 'client3',
    title: 'Paint bedroom walls',
    description: 'Need to repaint bedroom walls (about 20 sqm). Would like a light grey color.',
    category: 'painting',
    budget_min: 150,
    budget_max: 250,
    city: 'Sofia',
    district: 'Center',
    status: 'open',
    image_urls: [],
    assigned_master_id: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client3',
      email: 'client3@example.com',
      role: 'client',
      name: 'Elena Todorova',
      phone: null,
      city: 'Sofia',
      district: 'Center',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '4',
    client_id: 'client4',
    title: 'Bathroom tile repair',
    description: 'A few tiles in the bathroom are cracked and need replacement. Have matching tiles.',
    category: 'tiling',
    budget_min: 60,
    budget_max: 120,
    city: 'Sofia',
    district: 'Lozenets',
    status: 'open',
    image_urls: [],
    assigned_master_id: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client4',
      email: 'client4@example.com',
      role: 'client',
      name: 'Dimitar Kolev',
      phone: null,
      city: 'Sofia',
      district: 'Lozenets',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

interface JobCardProps {
  job: JobRequest;
  onSendOffer: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSendOffer }) => {
  const timeDiff = Date.now() - new Date(job.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / 3600000);
  const timeLabel =
    hoursAgo < 1
      ? 'Just now'
      : hoursAgo < 24
      ? `${hoursAgo}h ago`
      : `${Math.floor(hoursAgo / 24)}d ago`;

  return (
    <Card className="mb-4">
      {/* Header */}
      <View className="flex-row items-start mb-3">
        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
          <Text className="text-2xl">{getCategoryIcon(job.category)}</Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-gray-800 font-bold text-lg" numberOfLines={2}>
            {job.title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Badge label={getCategoryLabel(job.category)} variant="info" />
            <Text className="text-gray-400 text-xs ml-2">{timeLabel}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text className="text-gray-600 mb-3" numberOfLines={3}>
        {job.description}
      </Text>

      {/* Details */}
      <View className="flex-row flex-wrap mb-3">
        <View className="flex-row items-center mr-4 mb-1">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-1">{job.district}</Text>
        </View>
        {job.budget_min && job.budget_max && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {job.budget_min} - {job.budget_max} лв
            </Text>
          </View>
        )}
      </View>

      {/* Client */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center">
            <Text className="text-primary-600 font-semibold text-sm">
              {job.client?.name?.charAt(0) || 'C'}
            </Text>
          </View>
          <Text className="text-gray-600 text-sm ml-2">
            {job.client?.name || 'Client'}
          </Text>
        </View>
        <Button
          title="Send Offer"
          size="sm"
          fullWidth={false}
          onPress={onSendOffer}
        />
      </View>
    </Card>
  );
};

export default function AvailableJobsScreen() {
  const [jobs] = useState<JobRequest[]>(MOCK_JOBS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SofiaDistrict | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');

  const filteredJobs = jobs.filter((job) => {
    if (selectedCategory && job.category !== selectedCategory) return false;
    if (selectedDistrict && job.district !== selectedDistrict) return false;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSendOffer = (job: JobRequest) => {
    setSelectedJob(job);
    setOfferMessage('');
    setOfferPrice('');
    setShowOfferModal(true);
  };

  const submitOffer = async () => {
    if (!offerMessage.trim()) {
      Alert.alert('Error', 'Please write a message for your offer');
      return;
    }

    // TODO: Submit offer to API
    console.log('Submitting offer:', {
      job_id: selectedJob?.id,
      message: offerMessage,
      proposed_price: offerPrice ? parseInt(offerPrice) : null,
    });

    Alert.alert(
      'Offer Sent! 🎉',
      'Your offer has been sent to the client. You will be notified when they respond.',
      [{ text: 'OK', onPress: () => setShowOfferModal(false) }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Filter Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${
              showFilters ? 'bg-primary-100' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name="filter"
              size={16}
              color={showFilters ? '#2563eb' : '#6b7280'}
            />
            <Text
              className={`ml-1 text-sm font-medium ${
                showFilters ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              Filters
            </Text>
          </TouchableOpacity>

          {/* Category Quick Filters */}
          {JOB_CATEGORIES.slice(0, 4).map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === cat.value ? null : cat.value
                )
              }
              className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${
                selectedCategory === cat.value ? 'bg-primary-600' : 'bg-gray-100'
              }`}
            >
              <Text className="mr-1">{cat.icon}</Text>
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Extended Filters */}
      {showFilters && (
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-gray-700 font-medium mb-2">District</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() => setSelectedDistrict(null)}
              className={`px-3 py-2 rounded-full mr-2 ${
                !selectedDistrict ? 'bg-primary-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  !selectedDistrict ? 'text-white' : 'text-gray-600'
                }`}
              >
                All Districts
              </Text>
            </TouchableOpacity>
            {SOFIA_DISTRICTS.slice(0, 10).map((dist) => (
              <TouchableOpacity
                key={dist.value}
                onPress={() =>
                  setSelectedDistrict(
                    selectedDistrict === dist.value ? null : dist.value
                  )
                }
                className={`px-3 py-2 rounded-full mr-2 ${
                  selectedDistrict === dist.value ? 'bg-primary-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedDistrict === dist.value ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {dist.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Jobs List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Results Count */}
        <Text className="text-gray-500 text-sm mb-3">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
        </Text>

        {filteredJobs.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="search-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-semibold text-lg">No jobs found</Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              Try adjusting your filters or check back later for new jobs
            </Text>
            <Button
              title="Clear Filters"
              variant="outline"
              fullWidth={false}
              onPress={() => {
                setSelectedCategory(null);
                setSelectedDistrict(null);
              }}
              className="mt-4"
            />
          </View>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSendOffer={() => handleSendOffer(job)}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Send Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setShowOfferModal(false)}>
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-gray-800 font-bold text-lg">Send Offer</Text>
            <TouchableOpacity onPress={submitOffer}>
              <Text className="text-primary-600 font-semibold">Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            {/* Job Summary */}
            {selectedJob && (
              <Card className="mb-4" variant="outlined">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">
                    {getCategoryIcon(selectedJob.category)}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {selectedJob.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {selectedJob.district} •{' '}
                      {selectedJob.budget_min && selectedJob.budget_max
                        ? `${selectedJob.budget_min}-${selectedJob.budget_max} лв`
                        : 'Budget not specified'}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Message */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Your Message <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <TextInput
                  multiline
                  numberOfLines={5}
                  className="text-gray-800 text-base min-h-[120px]"
                  placeholder="Introduce yourself and explain why you're a good fit for this job. Include your availability and any relevant experience."
                  placeholderTextColor="#9ca3af"
                  value={offerMessage}
                  onChangeText={setOfferMessage}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Price */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Your Price (optional)
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="Enter your price estimate"
                  placeholderTextColor="#9ca3af"
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  keyboardType="number-pad"
                />
                <Text className="text-gray-500 font-medium">лв</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                Leave empty if you want to discuss pricing with the client
              </Text>
            </View>

            {/* Tips */}
            <Card variant="outlined" className="bg-blue-50 border-blue-200">
              <View className="flex-row">
                <Ionicons name="bulb-outline" size={20} color="#2563eb" />
                <View className="flex-1 ml-2">
                  <Text className="text-primary-700 font-medium">Tips for a great offer</Text>
                  <Text className="text-primary-600 text-sm mt-1">
                    • Be specific about your experience{'\n'}
                    • Mention when you can start{'\n'}
                    • Ask clarifying questions if needed
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
