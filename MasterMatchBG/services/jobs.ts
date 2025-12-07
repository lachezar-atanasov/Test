import { supabase } from './supabase';
import { JobRequest, CreateJobInput, JobStatus, JobCategory, SofiaDistrict } from '../types';

// ============================================
// Jobs Service
// ============================================

export const jobsService = {
  /**
   * Create a new job request
   */
  async createJob(clientId: string, input: CreateJobInput): Promise<{ job: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .insert({
        client_id: clientId,
        title: input.title,
        description: input.description,
        category: input.category,
        district: input.district,
        city: 'Sofia',
        budget_min: input.budget_min || null,
        budget_max: input.budget_max || null,
        image_urls: input.images || [],
        status: 'open',
      })
      .select()
      .single();

    return { job: data, error };
  },

  /**
   * Get all jobs for a client
   */
  async getClientJobs(clientId: string): Promise<{ jobs: JobRequest[]; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .select(`
        *,
        assigned_master:users!job_requests_assigned_master_id_fkey(id, name, email, avatar_url),
        offers:offers(count)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // Transform to include offers_count
    const jobs = data?.map((job: any) => ({
      ...job,
      offers_count: job.offers?.[0]?.count || 0,
    })) || [];

    return { jobs, error };
  },

  /**
   * Get available jobs (open status) with optional filters
   */
  async getAvailableJobs(filters?: {
    category?: JobCategory;
    district?: SofiaDistrict;
    limit?: number;
  }): Promise<{ jobs: JobRequest[]; error: any }> {
    let query = supabase
      .from('job_requests')
      .select(`
        *,
        client:users!job_requests_client_id_fkey(id, name, email, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.district) {
      query = query.eq('district', filters.district);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    return { jobs: data || [], error };
  },

  /**
   * Get a single job by ID
   */
  async getJob(jobId: string): Promise<{ job: JobRequest | null; error: any }> {
    const { data, error } = await supabase
      .from('job_requests')
      .select(`
        *,
        client:users!job_requests_client_id_fkey(id, name, email, phone, avatar_url),
        assigned_master:users!job_requests_assigned_master_id_fkey(id, name, email, avatar_url)
      `)
      .eq('id', jobId)
      .single();

    return { job: data, error };
  },

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    assignedMasterId?: string
  ): Promise<{ job: JobRequest | null; error: any }> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (assignedMasterId) {
      updates.assigned_master_id = assignedMasterId;
    }

    const { data, error } = await supabase
      .from('job_requests')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    return { job: data, error };
  },

  /**
   * Assign a master to a job
   */
  async assignMaster(jobId: string, masterId: string): Promise<{ job: JobRequest | null; error: any }> {
    return this.updateJobStatus(jobId, 'assigned', masterId);
  },

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string): Promise<{ job: JobRequest | null; error: any }> {
    return this.updateJobStatus(jobId, 'completed');
  },

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<{ job: JobRequest | null; error: any }> {
    return this.updateJobStatus(jobId, 'cancelled');
  },

  /**
   * Delete a job (only if status is 'open')
   */
  async deleteJob(jobId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('job_requests')
      .delete()
      .eq('id', jobId)
      .eq('status', 'open');

    return { error };
  },

  /**
   * Upload job images
   */
  async uploadJobImage(jobId: string, imageUri: string): Promise<{ url: string | null; error: any }> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('job-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        return { url: null, error };
      }

      const { data: urlData } = supabase.storage
        .from('job-images')
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  },
};

export default jobsService;
