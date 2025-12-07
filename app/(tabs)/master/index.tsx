import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableJobs } from '@/services/jobs';
import { JobRequest, ServiceCategory, SERVICE_CATEGORIES, DISTRICTS } from '@/types';
import { PressableCard, Badge, EmptyState, LoadingSpinner, Select } from '@/components/ui';

export default function MasterBrowseJobsScreen() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | ''>('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getAvailableJobs({
        category: categoryFilter || undefined,
        district: districtFilter || undefined,
        searchQuery: searchQuery || undefined,
      });
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
    }, [categoryFilter, districtFilter])
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchJobs();
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchJobs(false);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setDistrictFilter('');
    setSearchQuery('');
  };

  const getCategoryLabel = (category: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${min} - ${max} BGN`;
    if (min) return `From ${min} BGN`;
    if (max) return `Up to ${max} BGN`;
    return null;
  };

  const hasActiveFilters = categoryFilter || districtFilter || searchQuery;

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
        <Badge label={getCategoryLabel(item.category)} variant="info" size="sm" />
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={14} color="#64748b" />
        <Text className="text-secondary-600 text-sm ml-1">{item.district}</Text>
        {formatBudget(item.budget_min, item.budget_max) && (
          <>
            <View className="mx-2 w-1 h-1 rounded-full bg-secondary-400" />
            <Ionicons name="cash-outline" size={14} color="#64748b" />
            <Text className="text-secondary-600 text-sm ml-1">
              {formatBudget(item.budget_min, item.budget_max)}
            </Text>
          </>
        )}
      </View>

      <Text className="text-secondary-500 text-sm" numberOfLines={2}>
        {item.description}
      </Text>

      {item.preferred_date && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-secondary-100">
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text className="text-secondary-600 text-sm ml-1">
            Preferred: {new Date(item.preferred_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-secondary-100">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text className="text-secondary-500 text-xs ml-1">
            Posted {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-primary-600 font-medium text-sm">View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563eb" />
        </View>
      </View>
    </PressableCard>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-secondary-900">Browse Jobs</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-2">
        <View className="flex-row items-center bg-white border border-secondary-200 rounded-xl px-4">
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            className="flex-1 py-3 ml-2 text-secondary-900"
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons
              name={showFilters ? 'options' : 'options-outline'}
              size={20}
              color={hasActiveFilters ? '#2563eb' : '#64748b'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View className="px-4 pb-4 space-y-3">
          <Select
            placeholder="All Categories"
            value={categoryFilter}
            options={[{ value: '', label: 'All Categories' }, ...SERVICE_CATEGORIES]}
            onChange={(value) => setCategoryFilter(value as ServiceCategory | '')}
          />
          <View className="mt-3">
            <Select
              placeholder="All Districts"
              value={districtFilter}
              options={[
                { value: '', label: 'All Districts' },
                ...DISTRICTS.map((d) => ({ value: d, label: d })),
              ]}
              onChange={setDistrictFilter}
            />
          </View>
          {hasActiveFilters && (
            <TouchableOpacity
              className="flex-row items-center justify-center mt-2"
              onPress={clearFilters}
            >
              <Ionicons name="close-circle-outline" size={16} color="#64748b" />
              <Text className="text-secondary-600 ml-1">Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Jobs Found"
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'There are no open jobs at the moment. Check back later!'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
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
