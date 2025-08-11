import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdminAccess } from './useAdminAccess';

interface PersonalMetrics {
  unreadAnnouncements: number;
  unreadDocuments: number;
  pendingTasks: number;
  activityToday: number;
}

interface AdminMetrics extends PersonalMetrics {
  totalUsers: number;
  totalMessages: number;
  documentsCreated: number;
  engagementRate: number;
}

export function usePersonalMetrics() {
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const [metrics, setMetrics] = useState<PersonalMetrics | AdminMetrics>({
    unreadAnnouncements: 0,
    unreadDocuments: 0,
    pendingTasks: 0,
    activityToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMetrics({
        unreadAnnouncements: 0,
        unreadDocuments: 0,
        pendingTasks: 0,
        activityToday: 0
      });
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        if (isAdmin) {
          await fetchAdminMetrics();
        } else {
          await fetchUserMetrics();
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserMetrics = async () => {
      // Comunicados não lidos
      const { count: unreadAnnouncements } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .not('id', 'in', 
          `(${await supabase
            .from('announcement_reads')
            .select('announcement_id')
            .eq('user_id', user.id)
            .then(res => res.data?.map(r => r.announcement_id).join(',') || 'null')})`
        );

      // Documentos não confirmados
      const { count: unreadDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)
        .not('id', 'in',
          `(${await supabase
            .from('document_reads')
            .select('document_id')
            .eq('user_id', user.id)
            .eq('confirmed_read', true)
            .then(res => res.data?.map(r => r.document_id).join(',') || 'null')})`
        );

      // Tarefas pendentes (soma de comunicados + documentos)
      const pendingTasks = (unreadAnnouncements || 0) + (unreadDocuments || 0);

      // Atividade hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: activityToday } = await supabase
        .from('user_activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      setMetrics({
        unreadAnnouncements: unreadAnnouncements || 0,
        unreadDocuments: unreadDocuments || 0,
        pendingTasks,
        activityToday: activityToday || 0
      });
    };

    const fetchAdminMetrics = async () => {
      // Métricas pessoais do admin
      await fetchUserMetrics();
      
      // Métricas administrativas
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: documentsCreated } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      // Taxa de engajamento (simplificada)
      const { count: totalReads } = await supabase
        .from('announcement_reads')
        .select('*', { count: 'exact', head: true });

      const { count: totalAnnouncements } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

      const engagementRate = totalAnnouncements ? 
        Math.round(((totalReads || 0) / (totalAnnouncements * (totalUsers || 1))) * 100) : 0;

      setMetrics(prev => ({
        ...prev,
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        documentsCreated: documentsCreated || 0,
        engagementRate
      }));
    };

    fetchMetrics();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('metrics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcement_reads' },
        () => fetchMetrics()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'document_reads' },
        () => fetchMetrics()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_activity_logs' },
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, isAdmin]);

  return { metrics, loading, isAdmin };
}