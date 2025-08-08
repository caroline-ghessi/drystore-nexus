import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MentionMessage {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  author: {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  channel: {
    id: string;
    name: string;
    is_private: boolean;
  } | null;
  reply_to_id: string | null;
  is_read: boolean;
}

export const useMentions = (limit?: number) => {
  const [mentions, setMentions] = useState<MentionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchMentions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar mensagens onde o usuário foi mencionado
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          channel_id,
          reply_to_id,
          mentions,
          user_id,
          channels (
            id,
            name,
            is_private
          )
        `)
        .contains('mentions', [{ user_id: user.id }])
        .order('created_at', { ascending: false })
        .limit(limit || 50);

      if (messagesError) throw messagesError;

      // Buscar profiles dos autores separadamente
      const authorIds = messagesData?.map(m => m.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', authorIds);

      if (profilesError) throw profilesError;

      // Buscar status de leitura das menções
      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: readData, error: readError } = await supabase
        .from('mention_reads')
        .select('message_id')
        .eq('user_id', user.id)
        .in('message_id', messageIds);

      if (readError) throw readError;

      const readMessageIds = new Set(readData?.map(r => r.message_id) || []);
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const mentionsWithReadStatus = (messagesData || []).map(message => {
        const profile = profilesMap.get(message.user_id);
        return {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          channel_id: message.channel_id,
          reply_to_id: message.reply_to_id,
          author: {
            user_id: message.user_id,
            display_name: profile?.display_name || 'Usuário',
            avatar_url: profile?.avatar_url || null,
          },
          channel: message.channels,
          is_read: readMessageIds.has(message.id),
        };
      });

      setMentions(mentionsWithReadStatus);
      setUnreadCount(mentionsWithReadStatus.filter(m => !m.is_read).length);
    } catch (error) {
      console.error('Erro ao buscar menções:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('mention_reads')
        .insert({ user_id: user.id, message_id: messageId });

      // Atualizar estado local
      setMentions(prev => 
        prev.map(mention => 
          mention.id === messageId 
            ? { ...mention, is_read: true }
            : mention
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar menção como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unreadMentions = mentions.filter(m => !m.is_read);
    if (unreadMentions.length === 0) return;

    try {
      const inserts = unreadMentions.map(mention => ({
        user_id: user.id,
        message_id: mention.id,
      }));

      await supabase.from('mention_reads').insert(inserts);

      setMentions(prev => prev.map(mention => ({ ...mention, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as menções como lidas:', error);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, [user]);

  // Subscription para novas menções em tempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('mentions-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `mentions->0->>user_id=eq.${user.id}`,
        },
        () => {
          fetchMentions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    mentions,
    loading,
    unreadCount,
    fetchMentions,
    markAsRead,
    markAllAsRead,
  };
};