import { Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserFooterProps {
  isCollapsed: boolean;
}

interface UserProfile {
  display_name?: string;
  avatar_url?: string;
}

export function UserFooter({ isCollapsed }: UserFooterProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F97316&color=fff`;

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" className="h-8 w-8" asChild>
          <NavLink to="/settings">
            <Settings className="h-4 w-4" />
          </NavLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center gap-3 p-2 hover:bg-sidebar-accent 
                    rounded-lg cursor-pointer transition-colors group">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-sidebar-border"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online 
                        border-2 border-sidebar-background rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {displayName}
          </p>
          <p className="text-xs text-sidebar-muted-foreground truncate">
            Online
          </p>
        </div>
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            "p-1.5 hover:bg-sidebar-accent-foreground/10 rounded-lg transition-colors",
            "opacity-0 group-hover:opacity-100",
            isActive && "opacity-100 bg-sidebar-primary/10 text-sidebar-primary"
          )}
        >
          <Settings className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );
}