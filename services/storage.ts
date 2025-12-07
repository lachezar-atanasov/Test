import { supabase } from './supabase';

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(uri: string, path: string): Promise<{ data: { path: string } | null; error: any }> {
    try {
      // Convert local URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('job-images')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('job-images')
        .getPublicUrl(data.path);

      return { data: { path: urlData.publicUrl }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete image from storage
  async deleteImage(path: string): Promise<{ error: any }> {
    // Extract the path from the full URL
    const pathParts = path.split('/job-images/');
    const filePath = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from('job-images')
      .remove([filePath]);

    return { error };
  },
};
