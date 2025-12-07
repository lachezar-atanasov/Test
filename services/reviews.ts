import { supabase } from '@/lib/supabase';
import { Review, ReviewForm } from '@/types';

// Get reviews for a master
export async function getMasterReviews(masterId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:users!reviews_client_id_fkey(*)
    `)
    .eq('master_id', masterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get review for a specific job
export async function getJobReview(jobId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:users!reviews_client_id_fkey(*),
      master:master_profiles(
        *,
        user:users(*)
      )
    `)
    .eq('job_id', jobId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Create a review
export async function createReview(
  jobId: string,
  clientId: string,
  masterId: string,
  form: ReviewForm
): Promise<Review> {
  // Insert the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      job_id: jobId,
      client_id: clientId,
      master_id: masterId,
      rating: form.rating,
      comment: form.comment,
    })
    .select()
    .single();

  if (error) throw error;

  // Update master's average rating
  await updateMasterRating(masterId);

  return data;
}

// Update master's average rating
async function updateMasterRating(masterId: string): Promise<void> {
  // Get all reviews for this master
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('master_id', masterId);

  if (reviewsError) throw reviewsError;

  if (reviews && reviews.length > 0) {
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const { error: updateError } = await supabase
      .from('master_profiles')
      .update({
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
      })
      .eq('id', masterId);

    if (updateError) throw updateError;
  }
}

// Check if client has already reviewed a job
export async function hasReviewed(jobId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('job_id', jobId);

  if (error) throw error;
  return (data?.length || 0) > 0;
}
