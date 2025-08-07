import { useState, useEffect } from "react"
import { 
  Hash, 
  Lock, 
  MessageCircle, 
  FileText, 
  Users, 
  Settings, 
  Bell, 
  Plus,
  ChevronDown,
  ChevronRight,
  Home,
  Clock,
  Archive,
  Search,
  MoreHorizontal,
  Edit,
  Megaphone,
  BookOpen,
  Activity,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserStatus } from "@/components/ui/user-status"
import { CreateChannelModal } from "@/components/modals/CreateChannelModal"
import { CreateDocumentModal } from "@/components/modals/CreateDocumentModal"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useAdminAccess } from "@/hooks/useAdminAccess"
import drystoreLogo from "@/assets/drystore-logo.png"
import { DrystoreCube } from "@/components/drystore/DrystoreCube"

export function AppSidebar() {
  const { state } = useSidebar()
  const { user } = useAuth()
  const { isAdmin } = useAdminAccess()
  const location = useLocation()
  const currentPath = location.pathname
  
  const [channelsExpanded, setChannelsExpanded] = useState(true)
  const [dmExpanded, setDmExpanded] = useState(true)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  
  const [channels, setChannels] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  const isCollapsed = state === "collapsed"
  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 mx-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
      isActive 
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medium font-semibold" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
    )

  useEffect(() => {
    if (user) {
      fetchChannels()
      fetchProfiles()
      fetchUserProfile()
    }
  }, [user])

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('name')
    
    if (data) setChannels(data)
  }


  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id)
      .limit(10)
    
    if (data) setProfiles(data)
  }

  const fetchUserProfile = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) setUserProfile(data)
  }

  // Primary navigation items
  const primaryNavItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Comunicados", url: "/announcements", icon: Megaphone },
    { title: "Base de Conhecimento", url: "/knowledge-base", icon: BookOpen },
    { title: "Conversas", url: "/messages", icon: MessageCircle },
    { title: "Pessoas", url: "/people", icon: Users },
    { title: "Atividades", url: "/activity", icon: Activity },
    ...(isAdmin ? [{ title: "Administração", url: "/admin", icon: Shield }] : []),
  ]

  return (
    <>
      <Sidebar
        className="border-r-2 border-sidebar-border bg-sidebar shadow-elegant"
        collapsible="icon"
      >
        {/* Header with company info */}
        <SidebarHeader className="border-b-2 border-sidebar-border px-6 py-4">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
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
        </SidebarHeader>

        <SidebarContent className="px-0">
          {/* Search Bar */}
          {!isCollapsed && (
            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  className="pl-12 py-3 bg-sidebar-muted border-0 rounded-xl text-sidebar-foreground placeholder:text-sidebar-muted-foreground focus:bg-background focus:ring-2 focus:ring-sidebar-ring transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Primary Navigation */}
          <div className="px-2 py-2">
            <SidebarMenu className="space-y-1">
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span>{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          {/* User Status Section */}
          {!isCollapsed && (
            <div className="px-4 py-2 border-b border-sidebar-muted">
              <UserStatus 
                name={userProfile?.display_name || "Você"}
                status={userProfile?.status || "online"}
                customStatus="Trabalhando"
                className="text-sidebar-foreground"
              />
            </div>
          )}

          {/* Channels */}
          <SidebarGroup>
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-0 h-6 text-sidebar-foreground hover:text-sidebar-primary"
                onClick={() => setChannelsExpanded(!channelsExpanded)}
              >
                {channelsExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                {!isCollapsed && (
                  <span className="font-medium text-sm uppercase tracking-wide">Canais</span>
                )}
              </Button>
            </div>
            
            {channelsExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {channels.map((channel) => (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={`/channel/${channel.id}`} 
                          className={getNavCls}
                        >
                          {channel.is_private ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )}
                          {!isCollapsed && (
                            <span className="truncate">{channel.name}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {!isCollapsed && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button 
                          onClick={() => setCreateChannelOpen(true)}
                          className="w-full flex items-center gap-2 text-left text-sidebar-accent-foreground hover:text-sidebar-primary hover:bg-sidebar-accent pl-4 py-2 rounded-xl font-medium transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar canal</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

          {/* Direct Messages */}
          <SidebarGroup>
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-0 h-6 text-sidebar-foreground hover:text-sidebar-primary"
                onClick={() => setDmExpanded(!dmExpanded)}
              >
                {dmExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                {!isCollapsed && (
                  <span className="font-medium text-sm uppercase tracking-wide">Conversas</span>
                )}
              </Button>
            </div>
            
            {dmExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {profiles.map((profile) => (
                    <SidebarMenuItem key={profile.id}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={`/dm/${profile.user_id}`} 
                          className={getNavCls}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              profile.status === 'online' ? 'bg-status-online' :
                              profile.status === 'away' ? 'bg-status-away' :
                              profile.status === 'busy' ? 'bg-status-busy' :
                              'bg-status-offline'
                            }`} />
                            <div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center text-sidebar-primary-foreground text-xs font-medium">
                              {(profile.display_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          {!isCollapsed && (
                            <span className="truncate">{profile.display_name || 'Usuário'}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>

        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-sidebar-border p-2">
          {!isCollapsed ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <NavLink 
                      to="/settings" 
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      
      <CreateChannelModal 
        open={createChannelOpen} 
        onOpenChange={setCreateChannelOpen}
        onChannelCreated={fetchChannels}
      />
    </>
  )
}