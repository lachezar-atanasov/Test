import { supabase } from './supabase';
import { ChatMessage } from '../types';

// ============================================
// Chat Service
// ============================================

export const chatService = {
  /**
   * Send a message
   */
  async sendMessage(
    jobId: string,
    senderId: string,
    text: string
  ): Promise<{ message: ChatMessage | null; error: any }> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        job_id: jobId,
        sender_id: senderId,
        text,
      })
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, name, avatar_url)
      `)
      .single();

    return { message: data, error };
  },

  /**
   * Get messages for a job
   */
  async getMessages(
    jobId: string,
    options?: { limit?: number; before?: string }
  ): Promise<{ messages: ChatMessage[]; error: any }> {
    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, name, avatar_url)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.before) {
      query = query.lt('created_at', options.before);
    }

    const { data, error } = await query;

    // Reverse to show oldest first
    const messages = (data || []).reverse();

    return { messages, error };
  },

  /**
   * Subscribe to new messages for a job
   */
  subscribeToMessages(
    jobId: string,
    onMessage: (message: ChatMessage) => void
  ) {
    const subscription = supabase
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
          // Fetch the full message with sender info
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:users!chat_messages_sender_id_fkey(id, name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            onMessage(data);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Get conversation list for a user
   * Returns the latest message from each job they're involved in
   */
  async getConversations(
    userId: string,
    role: 'client' | 'master'
  ): Promise<{ conversations: any[]; error: any }> {
    // For clients: get jobs where they are the client
    // For masters: get jobs where they are the assigned master
    const jobField = role === 'client' ? 'client_id' : 'assigned_master_id';

    const { data: jobs, error } = await supabase
      .from('job_requests')
      .select(`
        id,
        title,
        status,
        client:users!job_requests_client_id_fkey(id, name, avatar_url),
        assigned_master:users!job_requests_assigned_master_id_fkey(id, name, avatar_url)
      `)
      .eq(jobField, userId)
      .eq('status', 'assigned');

    if (error || !jobs) {
      return { conversations: [], error };
    }

    // Get latest message for each job
    const conversations = await Promise.all(
      jobs.map(async (job) => {
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMessage = messages?.[0];
        const otherUser = role === 'client' ? job.assigned_master : job.client;

        return {
          jobId: job.id,
          jobTitle: job.title,
          otherUser,
          lastMessage: lastMessage?.text || null,
          lastMessageAt: lastMessage?.created_at || null,
          unreadCount: 0, // TODO: Implement unread tracking
        };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return { conversations, error: null };
  },

  /**
   * Mark messages as read
   */
  async markAsRead(jobId: string, userId: string): Promise<{ error: any }> {
    // This would require a read_at field or separate read receipts table
    // For MVP, we'll skip this implementation
    return { error: null };
  },
};

export default chatService;
