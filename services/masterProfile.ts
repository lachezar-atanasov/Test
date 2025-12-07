import { supabase } from '@/lib/supabase';
import { MasterProfile, MasterProfileForm } from '@/types';
import { STORAGE_BUCKETS } from '@/config/constants';

// Get master profile by user ID
export async function getMasterProfile(userId: string): Promise<MasterProfile | null> {
  const { data, error } = await supabase
    .from('master_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get master profile by master ID
export async function getMasterProfileById(masterId: string): Promise<MasterProfile | null> {
  const { data, error } = await supabase
    .from('master_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', masterId)
    .single();

  if (error) throw error;
  return data;
}

// Update master profile
export async function updateMasterProfile(
  masterId: string,
  form: MasterProfileForm
): Promise<MasterProfile> {
  const { data, error } = await supabase
    .from('master_profiles')
    .update({
      services: form.services,
      districts: form.districts,
      description: form.description,
      hourly_rate: form.hourly_rate,
      experience_years: form.experience_years,
      updated_at: new Date().toISOString(),
    })
    .eq('id', masterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Toggle availability
export async function toggleMasterAvailability(masterId: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from('master_profiles')
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', masterId);

  if (error) throw error;
}

// Upload avatar
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const filename = `${userId}/${Date.now()}.jpg`;
  
  // Convert uri to blob
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(filename);

  // Update user avatar URL
  await supabase
    .from('users')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);

  return data.publicUrl;
}

// Search masters by services and districts
export async function searchMasters(
  filters?: {
    services?: string[];
    districts?: string[];
    minRating?: number;
  }
): Promise<MasterProfile[]> {
  let query = supabase
    .from('master_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('is_available', true);

  if (filters?.services && filters.services.length > 0) {
    query = query.overlaps('services', filters.services);
  }

  if (filters?.districts && filters.districts.length > 0) {
    query = query.overlaps('districts', filters.districts);
  }

  if (filters?.minRating) {
    query = query.gte('average_rating', filters.minRating);
  }

  const { data, error } = await query.order('average_rating', { ascending: false });

  if (error) throw error;
  return data || [];
}
