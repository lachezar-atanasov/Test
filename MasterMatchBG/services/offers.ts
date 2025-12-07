import { supabase } from './supabase';
import { Offer, CreateOfferInput } from '../types';

// ============================================
// Offers Service
// ============================================

export const offersService = {
  /**
   * Create a new offer for a job
   */
  async createOffer(
    masterId: string,
    input: CreateOfferInput
  ): Promise<{ offer: Offer | null; error: any }> {
    // Check if master already sent an offer for this job
    const { data: existingOffer } = await supabase
      .from('offers')
      .select('id')
      .eq('job_id', input.job_id)
      .eq('master_id', masterId)
      .single();

    if (existingOffer) {
      return {
        offer: null,
        error: { message: 'You have already sent an offer for this job' },
      };
    }

    const { data, error } = await supabase
      .from('offers')
      .insert({
        job_id: input.job_id,
        master_id: masterId,
        message: input.message,
        proposed_price: input.proposed_price || null,
        status: 'pending',
      })
      .select()
      .single();

    return { offer: data, error };
  },

  /**
   * Get all offers for a job
   */
  async getJobOffers(jobId: string): Promise<{ offers: Offer[]; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        master:users!offers_master_id_fkey(id, name, email, avatar_url),
        master_profile:master_profiles!offers_master_id_fkey(
          bio,
          categories,
          average_rating,
          total_reviews,
          years_experience
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    return { offers: data || [], error };
  },

  /**
   * Get all offers sent by a master
   */
  async getMasterOffers(masterId: string): Promise<{ offers: Offer[]; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        job:job_requests(
          id,
          title,
          description,
          category,
          district,
          budget_min,
          budget_max,
          status,
          created_at,
          client:users!job_requests_client_id_fkey(id, name, avatar_url)
        )
      `)
      .eq('master_id', masterId)
      .order('created_at', { ascending: false });

    return { offers: data || [], error };
  },

  /**
   * Get a single offer by ID
   */
  async getOffer(offerId: string): Promise<{ offer: Offer | null; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        master:users!offers_master_id_fkey(id, name, email, phone, avatar_url),
        job:job_requests(*)
      `)
      .eq('id', offerId)
      .single();

    return { offer: data, error };
  },

  /**
   * Accept an offer (also rejects other offers for the same job)
   */
  async acceptOffer(offerId: string, jobId: string): Promise<{ error: any }> {
    // Start a transaction-like operation
    // 1. Update the accepted offer
    const { error: acceptError } = await supabase
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId);

    if (acceptError) {
      return { error: acceptError };
    }

    // 2. Reject all other offers for this job
    const { error: rejectError } = await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('job_id', jobId)
      .neq('id', offerId)
      .eq('status', 'pending');

    return { error: rejectError };
  },

  /**
   * Reject an offer
   */
  async rejectOffer(offerId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('offers')
      .update({ status: 'rejected' })
      .eq('id', offerId);

    return { error };
  },

  /**
   * Withdraw an offer (by master)
   */
  async withdrawOffer(offerId: string, masterId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId)
      .eq('master_id', masterId)
      .eq('status', 'pending');

    return { error };
  },

  /**
   * Count pending offers for a master
   */
  async countPendingOffers(masterId: string): Promise<{ count: number; error: any }> {
    const { count, error } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('master_id', masterId)
      .eq('status', 'pending');

    return { count: count || 0, error };
  },
};

export default offersService;
