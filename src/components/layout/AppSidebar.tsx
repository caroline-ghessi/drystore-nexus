import { useState } from "react"
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
import drystoreLogo from "@/assets/drystore-logo.png"

// Mock data - será substituído por dados reais
const channels = [
  { id: "geral", name: "geral", isPrivate: false, unread: 3 },
  { id: "anuncios", name: "anúncios", isPrivate: false, unread: 0 },
  { id: "desenvolvimento", name: "desenvolvimento", isPrivate: false, unread: 7 },
  { id: "marketing", name: "marketing", isPrivate: true, unread: 2 },
  { id: "rh", name: "recursos-humanos", isPrivate: true, unread: 0 },
]

const directMessages = [
  { id: "joao", name: "João Silva", status: "online", unread: 1 },
  { id: "maria", name: "Maria Santos", status: "away", unread: 0 },
  { id: "pedro", name: "Pedro Costa", status: "offline", unread: 2 },
]

const documents = [
  { id: "codigo-conduta", name: "Código de Conduta", category: "Políticas" },
  { id: "manual-funcionario", name: "Manual do Funcionário", category: "RH" },
  { id: "processos-ti", name: "Processos de TI", category: "Técnico" },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  
  const [channelsExpanded, setChannelsExpanded] = useState(true)
  const [dmExpanded, setDmExpanded] = useState(true)
  const [docsExpanded, setDocsExpanded] = useState(false)

  const isCollapsed = state === "collapsed"
  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/70 text-sidebar-foreground"

  const getTotalUnread = (items: any[]) => 
    items.reduce((total, item) => total + item.unread, 0)

  return (
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
              name="Você"
              status="online"
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
                  <>
                    <span className="font-medium">Canais</span>
                    {getTotalUnread(channels) > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {getTotalUnread(channels)}
                      </span>
                    )}
                  </>
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
                          {channel.isPrivate ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )}
                          {!isCollapsed && (
                            <>
                              <span className="truncate">{channel.name}</span>
                              {channel.unread > 0 && (
                                <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                  {channel.unread}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {!isCollapsed && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <button className="w-full flex items-center text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
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
                  <>
                    <span className="font-medium">Mensagens diretas</span>
                    {getTotalUnread(directMessages) > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {getTotalUnread(directMessages)}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
            
            {dmExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {directMessages.map((dm) => (
                    <SidebarMenuItem key={dm.id}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={`/dm/${dm.id}`} 
                          className={getNavCls}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              dm.status === 'online' ? 'bg-status-online' :
                              dm.status === 'away' ? 'bg-status-away' :
                              dm.status === 'busy' ? 'bg-status-busy' :
                              'bg-status-offline'
                            }`} />
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="truncate">{dm.name}</span>
                              {dm.unread > 0 && (
                                <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                  {dm.unread}
                                </span>
                              )}
                            </>
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
                            <span className="truncate">{doc.name}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                  <NavLink to="/notifications" className={getNavCls}>
                    <Bell className="h-4 w-4" />
                    <span>Notificações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
  )
}