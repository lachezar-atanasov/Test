import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { jobRequestService } from '../../../services/jobRequests';
import { supabase } from '../../../config/supabase';
import { JobRequest } from '../../../types/database';
import { JobCard } from '../../../components/JobCard';

export default function JobsScreen() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    if (!user || profile?.role !== 'client') return;

    setLoading(true);
    const { data, error } = await jobRequestService.getByClientId(user.id);
    setLoading(false);

    if (error) {
      console.error('Error loading jobs:', error);
    } else {
      setJobs(data);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [user, profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  if (profile?.role === 'master') {
    // For masters, show assigned/completed jobs
    useEffect(() => {
      loadMasterJobs();
    }, [user]);

    const loadMasterJobs = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('job_requests')
        .select('*')
        .eq('assigned_master_id', user.id)
        .in('status', ['assigned', 'completed'])
        .order('created_at', { ascending: false });

      setLoading(false);

      if (error) {
        console.error('Error loading master jobs:', error);
      } else {
        setJobs(data || []);
      }
    };

    const onRefreshMaster = async () => {
      setRefreshing(true);
      await loadMasterJobs();
      setRefreshing(false);
    };

    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">My Jobs</Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : jobs.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-gray-500 text-lg mb-2">No assigned jobs yet</Text>
            <Text className="text-gray-400 text-center">
              Jobs you're assigned to will appear here
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefreshMaster} />
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

  if (profile?.role === 'client') {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/jobs/create')}
            className="bg-blue-500 rounded-lg px-6 py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">+ Create New Job</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : jobs.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-gray-500 text-lg mb-2">No jobs yet</Text>
            <Text className="text-gray-400 text-center">
              Create your first job request to get started
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
      <Text className="text-xl">Jobs Screen</Text>
    </View>
  );
}
