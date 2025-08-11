import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  type: 'channel' | 'dm';
  isPinned: boolean;
  isMuted: boolean;
  lastMessageUserId?: string;
  lastMessageUserName?: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
    
    // Setup real-time subscription for messages
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get channels user is member of
      const { data: channelData } = await supabase
        .from('channels')
        .select(`
          id,
          name,
          is_private,
          channel_members!inner(user_id)
        `)
        .eq('channel_members.user_id', user.id);

      // Get latest message for each channel
      const channelConversations: Conversation[] = [];
      
      for (const channel of channelData || []) {
        const { data: latestMessage } = await supabase
          .from('messages')
          .select(`
            content,
            created_at,
            user_id,
            profiles:user_id(display_name)
          `)
          .eq('channel_id', channel.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        channelConversations.push({
          id: channel.id,
          name: channel.name,
          avatar: '', // Channels don't have avatars
          lastMessage: latestMessage?.content || 'Nenhuma mensagem',
          lastMessageTime: latestMessage?.created_at || new Date().toISOString(),
          unreadCount: 0, // TODO: Implement unread count logic
          isOnline: false,
          type: 'channel' as const,
          isPinned: false,
          isMuted: false,
          lastMessageUserId: latestMessage?.user_id,
          lastMessageUserName: (latestMessage as any)?.profiles?.display_name
        });
      }

      // Get profiles for DM conversations (simplified approach)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, status')
        .neq('user_id', user.id)
        .limit(10);

      const dmConversations: Conversation[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        name: profile.display_name || 'Usuário',
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&background=F97316&color=fff`,
        lastMessage: 'Conversa direta',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: profile.status === 'online',
        type: 'dm' as const,
        isPinned: false,
        isMuted: false
      }));

      // Combine and sort by last message time
      const allConversations = [...channelConversations, ...dmConversations]
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      setConversations(allConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDMChannelIds = async (): Promise<string> => {
    // This is a simplified approach - in a real app you'd have a proper DM channel system
    return '';
  };

  const searchConversations = (query: string) => {
    if (!query) return conversations;
    
    return conversations.filter(conv =>
      conv.name.toLowerCase().includes(query.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    conversations,
    loading,
    searchConversations,
    refreshConversations: fetchConversations
  };
}