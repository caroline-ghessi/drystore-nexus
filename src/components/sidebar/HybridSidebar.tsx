import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { DrystoreCube } from "@/components/drystore/DrystoreCube";
import { MainMenu } from "./MainMenu";
import { ConversationTab } from "./ConversationTab";
import { UserFooter } from "./UserFooter";
import { Search } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import "@/styles/sidebar-contrast.css";

export function HybridSidebar() {
  const { state } = useSidebar();
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');
  const [searchTerm, setSearchTerm] = useState('');
  const { counts } = useNotifications();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r-2 border-sidebar-border bg-sidebar shadow-elegant sidebar-scope"
      collapsible="icon"
    >
      {/* Header with Logo and Search */}
      <SidebarHeader className="border-b-2 border-sidebar-border px-4 py-4">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 mb-3">
              <DrystoreCube size="lg" animated />
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-sidebar-primary">Dry</span>
                  <span className="text-sidebar-foreground">store</span>
                </h1>
                <div className="flex items-center text-xs text-sidebar-muted-foreground tracking-wider uppercase">
                  <div className="w-2 h-2 bg-status-online rounded-full mr-1.5 animate-pulse" />
                  Portal Interno
                </div>
              </div>
            </div>
          ) : (
            <DrystoreCube size="md" animated />
          )}
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar ou começar conversa..."
              className="w-full pl-10 pr-3 py-2 bg-sidebar-accent/50 rounded-lg text-sm
                       placeholder-sidebar-muted-foreground focus:outline-none focus:ring-2 
                       focus:ring-sidebar-primary focus:bg-sidebar-background transition-all
                       border border-sidebar-border"
            />
          </div>
        )}
      </SidebarHeader>

      {/* Tab Toggle */}
      {!isCollapsed && (
        <div className="flex border-b border-sidebar-border bg-sidebar-accent/30">
          <button
            onClick={() => setActiveTab('menu')}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-all relative",
              activeTab === 'menu'
                ? "text-sidebar-primary bg-sidebar-background border-b-2 border-sidebar-primary"
                : "text-sidebar-muted-foreground hover:text-sidebar-foreground"
            )}
          >
            Menu Principal
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-all relative",
              activeTab === 'chat'
                ? "text-sidebar-primary bg-sidebar-background border-b-2 border-sidebar-primary"
                : "text-sidebar-muted-foreground hover:text-sidebar-foreground"
            )}
          >
            Conversas
            {counts.totalMessages > 0 && (
              <span className="absolute top-1.5 right-4 bg-destructive text-destructive-foreground 
                             text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center
                             animate-pulse">
                {counts.totalMessages > 99 ? '99+' : counts.totalMessages}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <SidebarContent className="p-0">
        {isCollapsed ? (
          <ConversationTab searchTerm={searchTerm} />
        ) : (
          activeTab === 'menu' ? (
            <MainMenu searchTerm={searchTerm} />
          ) : (
            <ConversationTab searchTerm={searchTerm} />
          )
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <UserFooter isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}