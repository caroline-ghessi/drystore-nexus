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
  Activity
} from "lucide-react"
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
import drystoreLogo from "@/assets/drystore-logo.png"

export function AppSidebar() {
  const { state } = useSidebar()
  const { user } = useAuth()
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
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-4 border-sidebar-primary rounded-l-none" 
      : "hover:bg-sidebar-accent/70 text-sidebar-foreground border-l-4 border-transparent rounded-l-none"

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
  ]

  return (
    <>
      <Sidebar
        className="border-r border-sidebar-border bg-sidebar-background"
        collapsible="icon"
      >
        {/* Header with company info */}
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <img 
                      src={drystoreLogo} 
                      alt="Drystore" 
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-sidebar-foreground">
                    Drystore
                  </h1>
                  <div className="flex items-center text-xs text-sidebar-muted-foreground">
                    <div className="w-2 h-2 bg-status-online rounded-full mr-1.5" />
                    Portal Interno
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
                <img 
                  src={drystoreLogo} 
                  alt="Drystore" 
                  className="h-5 w-5 object-contain"
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {/* Toggle sidebar */}}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-0">
          {/* Search Bar */}
          {!isCollapsed && (
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-muted-foreground" />
                <Input
                  placeholder="Buscar no Drystore"
                  className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted-foreground focus:border-sidebar-primary"
                />
              </div>
            </div>
          )}

          {/* Primary Navigation */}
          <div className="px-2 py-2">
            <SidebarMenu>
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
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
                className="w-full justify-start p-0 h-6 text-sidebar-muted-foreground hover:text-sidebar-foreground"
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
                          className="w-full flex items-center text-left text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 pl-4 border-l-4 border-transparent rounded-l-none"
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
                className="w-full justify-start p-0 h-6 text-sidebar-muted-foreground hover:text-sidebar-foreground"
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
                    className="hover:bg-sidebar-accent text-sidebar-muted-foreground hover:text-sidebar-foreground border-l-4 border-transparent rounded-l-none"
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