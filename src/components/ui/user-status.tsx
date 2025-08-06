import { cn } from "@/lib/utils"

interface UserStatusProps {
  name: string
  status: "online" | "away" | "busy" | "offline"
  customStatus?: string
  className?: string
}

export function UserStatus({ name, status, customStatus, className }: UserStatusProps) {
  const statusColors = {
    online: "bg-status-online",
    away: "bg-status-away", 
    busy: "bg-status-busy",
    offline: "bg-status-offline"
  }

  const statusLabels = {
    online: "Online",
    away: "Ausente",
    busy: "Ocupado",
    offline: "Offline"
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar-background",
          statusColors[status]
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sidebar-foreground truncate">
          {name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {customStatus || statusLabels[status]}
        </p>
      </div>
    </div>
  )
}