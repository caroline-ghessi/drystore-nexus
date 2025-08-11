import { 
  Home, 
  Bell,
  BookOpen, 
  Users, 
  Activity, 
  Shield,
  FileText,
  AtSign
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  color: string;
  adminOnly?: boolean;
}

interface MainMenuProps {
  searchTerm: string;
}

export function MainMenu({ searchTerm }: MainMenuProps) {
  const location = useLocation();
  const { counts } = useNotifications();
  const { isAdmin } = useAdminAccess();

  const menuItems: MenuItem[] = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      path: '/',
      color: 'text-blue-500'
    },
    { 
      id: 'announcements', 
      label: 'Comunicados', 
      icon: Bell, 
      path: '/announcements',
      badge: counts.announcements,
      color: 'text-orange-500'
    },
    { 
      id: 'knowledge', 
      label: 'Base de Conhecimento', 
      icon: BookOpen, 
      path: '/knowledge-base',
      color: 'text-green-500'
    },
    { 
      id: 'documents', 
      label: 'Documentos', 
      icon: FileText, 
      path: '/documents',
      color: 'text-purple-500'
    },
    { 
      id: 'people', 
      label: 'Pessoas', 
      icon: Users, 
      path: '/people',
      color: 'text-cyan-500'
    },
    { 
      id: 'mentions', 
      label: 'Menções', 
      icon: AtSign, 
      path: '/mentions',
      badge: counts.mentions,
      color: 'text-pink-500'
    },
    { 
      id: 'activities', 
      label: 'Atividades', 
      icon: Activity, 
      path: '/activity',
      color: 'text-indigo-500'
    },
    { 
      id: 'admin', 
      label: 'Administração', 
      icon: Shield, 
      path: '/admin',
      color: 'text-red-500',
      adminOnly: true
    }
  ];

  const filteredItems = menuItems.filter(item => {
    // Filter by admin access
    if (item.adminOnly && !isAdmin) return false;
    
    // Filter by search term
    if (searchTerm) {
      return item.label.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  return (
    <nav className="p-3">
      <div className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm border border-sidebar-primary/20" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-sidebar-primary/15" : "bg-sidebar-accent group-hover:bg-sidebar-accent-foreground/10"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-sidebar-primary" : item.color
                )} />
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5 min-w-[20px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 p-4 bg-sidebar-accent/50 rounded-lg border border-sidebar-border">
        <h3 className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider mb-3">
          Resumo Rápido
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sidebar-muted-foreground">Mensagens Não Lidas</span>
            <span className="font-semibold text-sidebar-primary">{counts.totalMessages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sidebar-muted-foreground">Comunicados Novos</span>
            <span className="font-semibold text-orange-500">{counts.announcements}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sidebar-muted-foreground">Menções</span>
            <span className="font-semibold text-pink-500">{counts.mentions}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}