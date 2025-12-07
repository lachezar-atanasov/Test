import { supabase } from './supabase';
import { MasterProfile, UpdateMasterProfileInput } from '../types';

// ============================================
// Master Profile Service
// ============================================

export const masterProfileService = {
  /**
   * Create initial master profile
   */
  async createProfile(
    userId: string,
    input: UpdateMasterProfileInput
  ): Promise<{ profile: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .insert({
        user_id: userId,
        bio: input.bio || null,
        categories: input.categories || [],
        districts: input.districts || [],
        base_price_min: input.base_price_min || null,
        base_price_max: input.base_price_max || null,
        years_experience: input.years_experience || null,
        portfolio_urls: [],
        is_verified: false,
        average_rating: null,
        total_reviews: 0,
      })
      .select()
      .single();

    return { profile: data, error };
  },

  /**
   * Get master profile by user ID
   */
  async getProfile(userId: string): Promise<{ profile: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { profile: data, error };
  },

  /**
   * Update master profile
   */
  async updateProfile(
    userId: string,
    updates: UpdateMasterProfileInput
  ): Promise<{ profile: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { profile: data, error };
  },

  /**
   * Add portfolio image
   */
  async addPortfolioImage(
    userId: string,
    imageUri: string
  ): Promise<{ url: string | null; error: any }> {
    try {
      // Upload image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${userId}/portfolio/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        return { url: null, error: uploadError };
      }

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);

      const url = urlData.publicUrl;

      // Add URL to profile
      const { data: profile } = await supabase
        .from('master_profiles')
        .select('portfolio_urls')
        .eq('user_id', userId)
        .single();

      const currentUrls = profile?.portfolio_urls || [];
      
      await supabase
        .from('master_profiles')
        .update({
          portfolio_urls: [...currentUrls, url],
        })
        .eq('user_id', userId);

      return { url, error: null };
    } catch (error) {
      return { url: null, error };
    }
  },

  /**
   * Remove portfolio image
   */
  async removePortfolioImage(
    userId: string,
    imageUrl: string
  ): Promise<{ error: any }> {
    const { data: profile } = await supabase
      .from('master_profiles')
      .select('portfolio_urls')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { error: { message: 'Profile not found' } };
    }

    const updatedUrls = (profile.portfolio_urls || []).filter(
      (url: string) => url !== imageUrl
    );

    const { error } = await supabase
      .from('master_profiles')
      .update({ portfolio_urls: updatedUrls })
      .eq('user_id', userId);

    return { error };
  },

  /**
   * Get master profile with user info (for public viewing)
   */
  async getPublicProfile(userId: string): Promise<{
    profile: (MasterProfile & { user: any }) | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .select(`
        *,
        user:users!master_profiles_user_id_fkey(id, name, avatar_url, created_at)
      `)
      .eq('user_id', userId)
      .single();

    return { profile: data, error };
  },

  /**
   * Search masters by category and district
   */
  async searchMasters(filters?: {
    categories?: string[];
    districts?: string[];
    minRating?: number;
  }): Promise<{ masters: any[]; error: any }> {
    let query = supabase
      .from('master_profiles')
      .select(`
        *,
        user:users!master_profiles_user_id_fkey(id, name, avatar_url)
      `);

    if (filters?.categories && filters.categories.length > 0) {
      query = query.overlaps('categories', filters.categories);
    }

    if (filters?.districts && filters.districts.length > 0) {
      query = query.overlaps('districts', filters.districts);
    }

    if (filters?.minRating) {
      query = query.gte('average_rating', filters.minRating);
    }

    const { data, error } = await query.order('average_rating', {
      ascending: false,
      nullsFirst: false,
    });

    return { masters: data || [], error };
  },
};

export default masterProfileService;
