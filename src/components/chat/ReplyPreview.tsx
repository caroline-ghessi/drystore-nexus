import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { extractCleanText } from '@/lib/utils'

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
  const cleanText = extractCleanText(message.content)
  const previewContent = cleanText.length > 50 
    ? cleanText.slice(0, 50) + '...' 
    : cleanText

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-l-4 border-primary rounded-r-lg mx-4 mb-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Avatar className="w-7 h-7">
          <AvatarImage src={message.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium text-primary mb-1">
            Respondendo para {displayName}
          </span>
          <p className="text-sm text-muted-foreground truncate leading-tight">
            {previewContent}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}