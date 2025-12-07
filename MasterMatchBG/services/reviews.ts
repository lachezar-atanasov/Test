import { supabase } from './supabase';
import { Review, CreateReviewInput } from '../types';

// ============================================
// Reviews Service
// ============================================

export const reviewsService = {
  /**
   * Create a review for a completed job
   */
  async createReview(
    clientId: string,
    input: CreateReviewInput
  ): Promise<{ review: Review | null; error: any }> {
    // Check if review already exists for this job
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('job_id', input.job_id)
      .single();

    if (existingReview) {
      return {
        review: null,
        error: { message: 'A review already exists for this job' },
      };
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        job_id: input.job_id,
        client_id: clientId,
        master_id: input.master_id,
        rating: input.rating,
        comment: input.comment || null,
      })
      .select()
      .single();

    if (!error) {
      // Update master's average rating
      await this.updateMasterRating(input.master_id);
    }

    return { review: data, error };
  },

  /**
   * Get reviews for a master
   */
  async getMasterReviews(masterId: string): Promise<{ reviews: Review[]; error: any }> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:users!reviews_client_id_fkey(id, name, avatar_url),
        job:job_requests(id, title, category, district)
      `)
      .eq('master_id', masterId)
      .order('created_at', { ascending: false });

    return { reviews: data || [], error };
  },

  /**
   * Get review for a specific job
   */
  async getJobReview(jobId: string): Promise<{ review: Review | null; error: any }> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:users!reviews_client_id_fkey(id, name, avatar_url)
      `)
      .eq('job_id', jobId)
      .single();

    return { review: data, error };
  },

  /**
   * Update master's average rating in their profile
   */
  async updateMasterRating(masterId: string): Promise<void> {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('master_id', masterId);

    if (!reviews || reviews.length === 0) return;

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await supabase
      .from('master_profiles')
      .update({
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
      })
      .eq('user_id', masterId);
  },

  /**
   * Get master's rating summary
   */
  async getMasterRatingSummary(masterId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { [key: number]: number };
    error: any;
  }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('master_id', masterId);

    if (error || !data) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        error,
      };
    }

    const totalReviews = data.length;
    const averageRating = totalReviews > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((r) => {
      ratingBreakdown[r.rating as keyof typeof ratingBreakdown]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingBreakdown,
      error: null,
    };
  },

  /**
   * Check if a review can be left for a job
   * (job must be completed and no existing review)
   */
  async canReviewJob(jobId: string): Promise<{ canReview: boolean; reason?: string }> {
    // Check job status
    const { data: job } = await supabase
      .from('job_requests')
      .select('status')
      .eq('id', jobId)
      .single();

    if (!job) {
      return { canReview: false, reason: 'Job not found' };
    }

    if (job.status !== 'completed') {
      return { canReview: false, reason: 'Job must be completed first' };
    }

    // Check for existing review
    const { data: review } = await supabase
      .from('reviews')
      .select('id')
      .eq('job_id', jobId)
      .single();

    if (review) {
      return { canReview: false, reason: 'Review already submitted' };
    }

    return { canReview: true };
  },
};

export default reviewsService;
