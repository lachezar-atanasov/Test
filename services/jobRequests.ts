import { supabase } from './supabase';
import { JobRequest, JobStatus } from '../types/database';

export interface CreateJobRequestInput {
  title: string;
  description: string;
  district: string;
  budget_min?: number;
  budget_max?: number;
  images?: string[];
}

export interface UpdateJobRequestInput {
  title?: string;
  description?: string;
  district?: string;
  budget_min?: number;
  budget_max?: number;
  status?: JobStatus;
  images?: string[];
}

export const jobRequestService = {
  // Create a new job request
  async create(input: CreateJobRequestInput, clientId: string): Promise<{ data: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .insert({
        ...input,
        client_id: clientId,
        status: 'open',
      })
      .select()
      .single();

    return { data, error };
  },

  // Get job request by ID
  async getById(id: string): Promise<{ data: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Get all job requests for a client
  async getByClientId(clientId: string): Promise<{ data: JobRequest[]; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  // Get open job requests (for masters to browse)
  async getOpenJobs(district?: string): Promise<{ data: JobRequest[]; error: any }> {
    let query = supabase
      .from('job_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (district) {
      query = query.eq('district', district);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  },

  // Update job request
  async update(id: string, input: UpdateJobRequestInput): Promise<{ data: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Delete job request
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('job_requests')
      .delete()
      .eq('id', id);

    return { error };
  },

  // Assign master to job (accept offer)
  async assignMaster(jobId: string, masterId: string): Promise<{ data: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .update({
        assigned_master_id: masterId,
        status: 'assigned',
      })
      .eq('id', jobId)
      .select()
      .single();

    return { data, error };
  },
};
