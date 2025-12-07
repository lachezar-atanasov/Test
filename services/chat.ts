import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Get chat messages for a job
export async function getChatMessages(jobId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users(*)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Send a chat message
export async function sendMessage(
  jobId: string,
  senderId: string,
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      job_id: jobId,
      sender_id: senderId,
      content,
    })
    .select(`
      *,
      sender:users(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

// Subscribe to real-time chat messages
export function subscribeToChat(
  jobId: string,
  onMessage: (message: ChatMessage) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`chat:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `job_id=eq.${jobId}`,
      },
      async (payload) => {
        // Fetch the complete message with sender info
        const { data } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:users(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onMessage(data);
        }
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from chat
export function unsubscribeFromChat(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// Get unread message count for a job
export async function getUnreadMessageCount(
  jobId: string,
  userId: string,
  lastReadAt: string
): Promise<number> {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .neq('sender_id', userId)
    .gt('created_at', lastReadAt);

  if (error) throw error;
  return count || 0;
}
