import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ReplyPreviewProps {
  message: {
    id: string
    content: string
    user_id: string
    display_name: string | null
    avatar_url: string | null
    created_at: string
  }
  onCancel: () => void
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  const displayName = message.display_name || 'Usuário'
  const previewContent = message.content.length > 50 
    ? message.content.slice(0, 50) + '...' 
    : message.content

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-l-4 border-primary">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Avatar className="w-6 h-6">
          <AvatarImage src={message.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium text-primary">
            Respondendo para {displayName}
          </span>
          <p className="text-sm text-muted-foreground truncate">
            {previewContent}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}