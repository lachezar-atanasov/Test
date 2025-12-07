import { supabase } from '@/lib/supabase';
import { Offer, OfferForm, OfferStatus } from '@/types';

// Get offers for a job (for clients to review)
export async function getJobOffers(jobId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      master:master_profiles(
        *,
        user:users(*)
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get offers made by a master
export async function getMasterOffers(masterId: string, status?: OfferStatus): Promise<Offer[]> {
  let query = supabase
    .from('offers')
    .select(`
      *,
      job:job_requests(
        *,
        client:users!job_requests_client_id_fkey(*)
      )
    `)
    .eq('master_id', masterId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Create an offer
export async function createOffer(
  jobId: string,
  masterId: string,
  form: OfferForm
): Promise<Offer> {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      job_id: jobId,
      master_id: masterId,
      price: form.price,
      estimated_duration: form.estimated_duration,
      message: form.message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update offer status
export async function updateOfferStatus(offerId: string, status: OfferStatus): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', offerId);

  if (error) throw error;
}

// Accept an offer (updates offer status and assigns master to job)
export async function acceptOffer(offerId: string, jobId: string, masterId: string): Promise<void> {
  // Start a transaction-like operation
  // First, update the accepted offer
  const { error: offerError } = await supabase
    .from('offers')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', offerId);

  if (offerError) throw offerError;

  // Reject all other pending offers for this job
  const { error: rejectError } = await supabase
    .from('offers')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('job_id', jobId)
    .neq('id', offerId)
    .eq('status', 'pending');

  if (rejectError) throw rejectError;

  // Assign master to job
  const { error: jobError } = await supabase
    .from('job_requests')
    .update({
      assigned_master_id: masterId,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (jobError) throw jobError;
}

// Withdraw an offer (by master)
export async function withdrawOffer(offerId: string): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
    .eq('id', offerId);

  if (error) throw error;
}

// Check if master has already made an offer for a job
export async function hasExistingOffer(jobId: string, masterId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('offers')
    .select('id')
    .eq('job_id', jobId)
    .eq('master_id', masterId)
    .in('status', ['pending', 'accepted']);

  if (error) throw error;
  return (data?.length || 0) > 0;
}
