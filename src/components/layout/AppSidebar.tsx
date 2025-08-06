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
  ChevronRight
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
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
  const [docsExpanded, setDocsExpanded] = useState(false)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false)
  
  const [channels, setChannels] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  const isCollapsed = state === "collapsed"
  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/70 text-sidebar-foreground"

  useEffect(() => {
    if (user) {
      fetchChannels()
      fetchDocuments()
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

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setDocuments(data)
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

  return (
    <>
      <Sidebar
        className="border-r border-sidebar-border"
        collapsible="icon"
      >
        <SidebarContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={drystoreLogo} 
                    alt="Drystore" 
                    className="h-8 w-auto"
                  />
                  <div>
                    <h1 className="text-lg font-semibold text-sidebar-foreground">
                      Drystore
                    </h1>
                    <p className="text-xs text-sidebar-foreground/70">Portal Interno</p>
                  </div>
                </div>
              )}
              <SidebarTrigger className="h-8 w-8" />
            </div>
          </div>

          {/* User Status */}
          {!isCollapsed && (
            <div className="p-4 border-b border-sidebar-border">
              <UserStatus 
                name={userProfile?.display_name || "Você"}
                status={userProfile?.status || "online"}
                customStatus="Trabalhando"
              />
            </div>
          )}

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto">
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
                    <span className="font-medium">Canais</span>
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
                            className="w-full flex items-center text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
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
                    <span className="font-medium">Mensagens diretas</span>
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
                              <MessageCircle className="h-4 w-4" />
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

            {/* Documents */}
            <SidebarGroup>
              <div className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start p-0 h-6 text-sidebar-foreground hover:text-sidebar-primary"
                  onClick={() => setDocsExpanded(!docsExpanded)}
                >
                  {docsExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  {!isCollapsed && <span className="font-medium">Documentos</span>}
                </Button>
              </div>
              
              {docsExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {documents.map((doc) => (
                      <SidebarMenuItem key={doc.id}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={`/documents/${doc.id}`} 
                            className={getNavCls}
                          >
                            <FileText className="h-4 w-4" />
                            {!isCollapsed && (
                              <span className="truncate">{doc.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {!isCollapsed && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <button 
                            onClick={() => setCreateDocumentOpen(true)}
                            className="w-full flex items-center text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Adicionar documento</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          </div>

          {/* Footer Navigation */}
          {!isCollapsed && (
            <div className="border-t border-sidebar-border p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/settings" className={getNavCls}>
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
      
      <CreateChannelModal 
        open={createChannelOpen} 
        onOpenChange={setCreateChannelOpen}
        onChannelCreated={fetchChannels}
      />
      <CreateDocumentModal 
        open={createDocumentOpen} 
        onOpenChange={setCreateDocumentOpen}
      />
    </>
  )
}