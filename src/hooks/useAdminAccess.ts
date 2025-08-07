import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAccess() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('permission')
          .eq('user_id', user.id)
          .eq('permission', 'admin')
          .maybeSingle();

        setIsAdmin(!!userRole);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  const hasPermission = (permission: 'admin' | 'user') => {
    if (permission === 'user') return !!user;
    return isAdmin;
  };

  return { isAdmin, loading, hasPermission };
}