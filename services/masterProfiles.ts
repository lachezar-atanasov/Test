import { supabase } from './supabase';
import { MasterProfile } from '../types/database';

export interface CreateMasterProfileInput {
  id: string;
  services: string[];
  districts: string[];
  hourly_rate?: number;
  bio?: string;
}

export interface UpdateMasterProfileInput {
  services?: string[];
  districts?: string[];
  hourly_rate?: number;
  bio?: string;
}

export const masterProfileService = {
  // Create master profile
  async create(input: CreateMasterProfileInput): Promise<{ data: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .insert(input)
      .select()
      .single();

    return { data, error };
  },

  // Get master profile by ID
  async getById(id: string): Promise<{ data: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Update master profile
  async update(id: string, input: UpdateMasterProfileInput): Promise<{ data: MasterProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('master_profiles')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },
};
