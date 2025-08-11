import { useState } from "react"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DrystoreCube } from "@/components/drystore/DrystoreCube"
import { ConversationList } from "@/components/chat/ConversationList"
import "@/styles/sidebar-contrast.css"

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      className="border-r-2 border-sidebar-border bg-sidebar shadow-elegant sidebar-scope"
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

      {/* Conversation List - WhatsApp Style */}
      <SidebarContent className="p-0">
        <ConversationList />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!isCollapsed ? (
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
        ) : (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" className="h-8 w-8" asChild>
              <NavLink to="/settings">
                <Settings className="h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}