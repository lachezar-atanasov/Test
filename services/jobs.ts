import { supabase } from '@/lib/supabase';
import { JobRequest, JobRequestForm, JobStatus, ServiceCategory } from '@/types';
import { STORAGE_BUCKETS, DEFAULT_PAGE_SIZE } from '@/config/constants';
import * as ImagePicker from 'expo-image-picker';

// Fetch jobs for clients (their own jobs)
export async function getClientJobs(clientId: string, status?: JobStatus): Promise<JobRequest[]> {
  let query = supabase
    .from('job_requests')
    .select(`
      *,
      client:users!job_requests_client_id_fkey(*),
      offers_count:offers(count)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data?.map(job => ({
    ...job,
    offers_count: job.offers_count?.[0]?.count || 0,
  })) || [];
}

// Fetch available jobs for masters
export async function getAvailableJobs(
  filters?: {
    category?: ServiceCategory;
    district?: string;
    searchQuery?: string;
  },
  page: number = 0
): Promise<JobRequest[]> {
  let query = supabase
    .from('job_requests')
    .select(`
      *,
      client:users!job_requests_client_id_fkey(*)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE - 1);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.district) {
    query = query.eq('district', filters.district);
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
}

// Fetch jobs assigned to a master
export async function getMasterJobs(masterId: string, status?: JobStatus): Promise<JobRequest[]> {
  let query = supabase
    .from('job_requests')
    .select(`
      *,
      client:users!job_requests_client_id_fkey(*)
    `)
    .eq('assigned_master_id', masterId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
}

// Fetch single job with details
export async function getJobById(jobId: string): Promise<JobRequest | null> {
  const { data, error } = await supabase
    .from('job_requests')
    .select(`
      *,
      client:users!job_requests_client_id_fkey(*),
      assigned_master:master_profiles!job_requests_assigned_master_id_fkey(
        *,
        user:users(*)
      )
    `)
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

// Create a new job request
export async function createJob(clientId: string, form: JobRequestForm): Promise<JobRequest> {
  const { data, error } = await supabase
    .from('job_requests')
    .insert({
      client_id: clientId,
      title: form.title,
      description: form.description,
      category: form.category,
      district: form.district,
      address: form.address,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      preferred_date: form.preferred_date,
      images: form.images,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update job status
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
  const { error } = await supabase
    .from('job_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', jobId);

  if (error) throw error;
}

// Assign master to job
export async function assignMasterToJob(jobId: string, masterId: string): Promise<void> {
  const { error } = await supabase
    .from('job_requests')
    .update({
      assigned_master_id: masterId,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) throw error;
}

// Upload job image
export async function uploadJobImage(uri: string, jobId: string): Promise<string> {
  const filename = `${jobId}/${Date.now()}.jpg`;
  
  // Convert uri to blob
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.JOB_IMAGES)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.JOB_IMAGES)
    .getPublicUrl(filename);

  return data.publicUrl;
}

// Pick image from library
export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images' as ImagePicker.MediaType,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
}

// Request camera permissions
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Request media library permissions
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}
