import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PendingTask {
  id: string;
  type: 'announcement' | 'document';
  title: string;
  description: string;
  priority: string;
  created_at: string;
  resource_id: string;
}

export function usePendingTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchPendingTasks = async () => {
      try {
        const { data, error } = await supabase.rpc('get_pending_tasks');

        if (error) throw error;

        setTasks((data || []).map(task => ({
          ...task,
          type: task.type as 'announcement' | 'document'
        })));
      } catch (error) {
        console.error('Error fetching pending tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingTasks();

    // Subscribe to changes in announcements and documents
    const announcementsSubscription = supabase
      .channel('pending-tasks-announcements')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchPendingTasks()
      )
      .subscribe();

    const documentsSubscription = supabase
      .channel('pending-tasks-documents')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => fetchPendingTasks()
      )
      .subscribe();

    const readsSubscription = supabase
      .channel('pending-tasks-reads')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcement_reads' },
        () => fetchPendingTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'document_reads' },
        () => fetchPendingTasks()
      )
      .subscribe();

    return () => {
      announcementsSubscription.unsubscribe();
      documentsSubscription.unsubscribe();
      readsSubscription.unsubscribe();
    };
  }, [user]);

  const getTasksByPriority = () => {
    const urgent = tasks.filter(task => task.priority === 'urgent');
    const important = tasks.filter(task => task.priority === 'important');
    const normal = tasks.filter(task => task.priority === 'normal');

    return { urgent, important, normal };
  };

  return {
    tasks,
    loading,
    getTasksByPriority,
    totalCount: tasks.length,
    urgentCount: tasks.filter(t => t.priority === 'urgent').length
  };
}