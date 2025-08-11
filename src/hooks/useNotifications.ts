import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationCounts {
  totalMessages: number;
  announcements: number;
  mentions: number;
  documents: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    totalMessages: 0,
    announcements: 0,
    mentions: 0,
    documents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCounts({
        totalMessages: 0,
        announcements: 0,
        mentions: 0,
        documents: 0,
      });
      setLoading(false);
      return;
    }

    const fetchNotificationCounts = async () => {
      try {
        // Get unread messages count - simplified for now
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', getLastReadTime());

        // Get unread announcements count
        const { count: announcementsCount } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', getLastAnnouncementReadTime());

        // Get mentions count - temporarily set to 0
        const mentionsCount = 0;

        setCounts({
          totalMessages: messagesCount || 0,
          announcements: announcementsCount || 0,
          mentions: mentionsCount || 0,
          documents: 0, // TODO: Implement documents notifications
        });
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationCounts();

    // Set up real-time subscriptions
    const messagesSubscription = supabase
      .channel('notification-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchNotificationCounts()
      )
      .subscribe();

    const announcementsSubscription = supabase
      .channel('notification-announcements')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchNotificationCounts()
      )
      .subscribe();

    const mentionsSubscription = supabase
      .channel('notification-mentions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mention_reads' },
        () => fetchNotificationCounts()
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      announcementsSubscription.unsubscribe();
      mentionsSubscription.unsubscribe();
    };
  }, [user]);

  const getUserChannelIds = async (): Promise<string> => {
    if (!user) return '';
    
    const { data } = await supabase
      .from('channel_members')
      .select('channel_id')
      .eq('user_id', user.id);
    
    return data?.map(m => m.channel_id).join(',') || '';
  };

  const getLastReadTime = (): string => {
    // TODO: Implement user's last read time tracking
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  };

  const getLastAnnouncementReadTime = (): string => {
    // TODO: Implement announcement read tracking
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  };

  return { counts, loading };
}