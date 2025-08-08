import { useState } from 'react'
import { Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/utils'

interface MessageItemProps {
  message: {
    id: string
    content: string
    user_id: string
    created_at: string
    edited?: boolean
    attachments?: any[]
    reply_to_id?: string | null
    mentions?: string[]
  }
  author: {
    display_name: string | null
    avatar_url: string | null
  }
  replyToMessage?: {
    id: string
    content: string
    user_id: string
    display_name: string | null
    avatar_url: string | null
  } | null
  currentUserId?: string
  onReply?: (message: any) => void
  showDateSeparator?: boolean
  isCurrentUser?: boolean
}

export function MessageItem({
  message,
  author,
  replyToMessage,
  currentUserId,
  onReply,
  showDateSeparator,
  isCurrentUser
}: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const displayName = author.display_name || 'Usuário'

  const renderContent = (content: string) => {
    if (!content) return null
    
    let processedContent = content
    
    // Process mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach((mention: any) => {
        if (typeof mention === 'object' && mention.display_name) {
          const mentionPattern = new RegExp(`@${mention.display_name}`, 'g')
          processedContent = processedContent.replace(
            mentionPattern,
            `<span class="mention bg-primary/10 text-primary px-1 rounded">@${mention.display_name}</span>`
          )
        }
      })
    }
    
    // Always render HTML content using dangerouslySetInnerHTML
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />
  }

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {message.attachments.map((attachment: any, index: number) => (
          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
            {attachment.type?.startsWith('image/') ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-xs max-h-48 rounded"
                loading="lazy"
              />
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                📎 {attachment.name}
              </a>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center py-4">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
            {formatDate(message.created_at)}
          </div>
        </div>
      )}
      
      <div
        className="group hover:bg-muted/30 px-4 py-2 transition-colors relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Reply thread line */}
        {replyToMessage && (
          <div className="ml-12 mb-2 pl-4 border-l-2 border-muted">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="w-4 h-4">
                <AvatarImage src={replyToMessage.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {(replyToMessage.display_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{replyToMessage.display_name || 'Usuário'}</span>
              <span className="truncate max-w-xs">
                {replyToMessage.content.length > 50 
                  ? replyToMessage.content.slice(0, 50) + '...' 
                  : replyToMessage.content}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={author.avatar_url || undefined} />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-foreground">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {message.edited && (
                <Badge variant="secondary" className="text-xs">
                  editado
                </Badge>
              )}
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  você
                </Badge>
              )}
            </div>
            
            <div className="text-foreground break-words">
              {renderContent(message.content)}
              {renderAttachments()}
            </div>
          </div>

          {/* Reply button */}
          {isHovered && onReply && (
            <div className="flex items-start pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply({
                  id: message.id,
                  content: message.content,
                  user_id: message.user_id,
                  display_name: author.display_name,
                  avatar_url: author.avatar_url,
                  created_at: message.created_at
                })}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}