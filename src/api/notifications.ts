import { supabase } from './supabase';
import type { NotificationSettings, PushToken } from '../types/database';

/**
 * Get notification settings for a user
 */
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }

  return data;
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<Omit<NotificationSettings, 'id' | 'user_id'>>
): Promise<boolean> {
  // Try to update first
  const { data: existing } = await supabase
    .from('notification_settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  } else {
    // Insert if doesn't exist
    const { error } = await supabase.from('notification_settings').insert({
      user_id: userId,
      enable_push: settings.enable_push ?? true,
      days_before: settings.days_before ?? [3, 0],
      quiet_hours_start: settings.quiet_hours_start ?? null,
      quiet_hours_end: settings.quiet_hours_end ?? null,
    });

    if (error) {
      console.error('Error creating notification settings:', error);
      return false;
    }
  }

  return true;
}

/**
 * Save push token for a user
 */
export async function savePushToken(
  userId: string,
  token: string,
  deviceType: 'ios' | 'android' | 'web'
): Promise<boolean> {
  // Check if token already exists
  const { data: existing } = await supabase
    .from('push_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('token', token)
    .single();

  if (existing) {
    // Update existing token
    const { error } = await supabase
      .from('push_tokens')
      .update({ device_type: deviceType, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating push token:', error);
      return false;
    }
  } else {
    // Insert new token
    const { error } = await supabase.from('push_tokens').insert({
      user_id: userId,
      token,
      device_type: deviceType,
    });

    if (error) {
      console.error('Error saving push token:', error);
      return false;
    }
  }

  return true;
}

/**
 * Get push tokens for a user
 */
export async function getPushTokens(userId: string): Promise<PushToken[]> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting push tokens:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete a push token
 */
export async function deletePushToken(tokenId: string): Promise<boolean> {
  const { error } = await supabase.from('push_tokens').delete().eq('id', tokenId);

  if (error) {
    console.error('Error deleting push token:', error);
    return false;
  }

  return true;
}

/**
 * Delete all push tokens for a user
 */
export async function deleteAllPushTokens(userId: string): Promise<boolean> {
  const { error } = await supabase.from('push_tokens').delete().eq('user_id', userId);

  if (error) {
    console.error('Error deleting push tokens:', error);
    return false;
  }

  return true;
}
