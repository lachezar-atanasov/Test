import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { jobRequestService } from '../../services/jobRequests';
import { masterProfileService } from '../../services/masterProfiles';
import { JobRequest } from '../../types/database';
import { JobCard } from '../../components/JobCard';
import { DISTRICTS } from '../../config/districts';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [selectedDistrict]);

  const loadJobs = async () => {
    if (profile?.role !== 'master') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await jobRequestService.getOpenJobs(selectedDistrict || undefined);
    setLoading(false);

    if (error) {
      console.error('Error loading jobs:', error);
    } else {
      setJobs(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  if (profile?.role === 'client') {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl text-gray-600">Welcome to MasterMatch!</Text>
        <Text className="text-gray-500 mt-2">Go to Jobs tab to create a job request</Text>
      </View>
    );
  }

  if (profile?.role === 'master') {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Available Jobs</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setSelectedDistrict(null)}
                className={`px-4 py-2 rounded-full border ${
                  selectedDistrict === null
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text className={selectedDistrict === null ? 'text-white font-semibold' : 'text-gray-700'}>
                  All Districts
                </Text>
              </TouchableOpacity>
              {DISTRICTS.map((district) => (
                <TouchableOpacity
                  key={district}
                  onPress={() => setSelectedDistrict(district)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedDistrict === district
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={selectedDistrict === district ? 'text-white font-semibold' : 'text-gray-700'}
                  >
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : jobs.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-gray-500 text-lg mb-2">No jobs available</Text>
            <Text className="text-gray-400 text-center">
              {selectedDistrict
                ? `No open jobs in ${selectedDistrict}`
                : 'No open jobs at the moment'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl">Welcome</Text>
    </View>
  );
}
