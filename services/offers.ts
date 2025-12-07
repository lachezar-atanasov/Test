import { supabase } from './supabase';
import { Offer, OfferStatus } from '../types/database';

export interface CreateOfferInput {
  job_request_id: string;
  master_id: string;
  price: number;
  message?: string;
}

export const offerService = {
  // Create an offer
  async create(input: CreateOfferInput): Promise<{ data: Offer | null; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        ...input,
        status: 'pending',
      })
      .select()
      .single();

    return { data, error };
  },

  // Get offers for a job
  async getByJobId(jobId: string): Promise<{ data: Offer[]; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('job_request_id', jobId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  // Get offers by master
  async getByMasterId(masterId: string): Promise<{ data: Offer[]; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('master_id', masterId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  // Update offer status (accept/reject)
  async updateStatus(id: string, status: OfferStatus): Promise<{ data: Offer | null; error: any }> {
    const { data, error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },
};
