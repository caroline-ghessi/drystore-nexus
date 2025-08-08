import { useState } from 'react'
import { Reply, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate, extractCleanText } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { ReplyPreview } from './ReplyPreview'

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
  // New props for replies UX
  repliesCount?: number
  lastReplyId?: string
  onJumpToMessage?: (id: string) => void
  registerMessageRef?: (id: string, el: HTMLDivElement | null) => void
  isHighlighted?: boolean
}

export function MessageItem({
  message,
  author,
  replyToMessage,
  currentUserId,
  onReply,
  showDateSeparator,
  isCurrentUser,
  repliesCount,
  lastReplyId,
  onJumpToMessage,
  registerMessageRef,
  isHighlighted
}: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string; name?: string } | null>(null)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const displayName = author.display_name || 'Usuário'

  const renderContent = (content: string) => {
    if (!content) return null
    
    let processedContent = content
    
    // Clean up empty p tags and extra whitespace
    processedContent = processedContent
      .replace(/<p><\/p>/g, '') // Remove empty p tags
      .replace(/<p>\s*<\/p>/g, '') // Remove p tags with only whitespace
      .trim()
    
    // Process mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach((mention: any) => {
        if (typeof mention === 'object' && mention.display_name) {
          const mentionPattern = new RegExp(`@${mention.display_name}`, 'g')
          const mentionClass = isCurrentUser 
            ? "mention bg-orange-200 text-orange-800 px-1 rounded font-medium"
            : "mention bg-primary/10 text-primary px-1 rounded font-medium"
          processedContent = processedContent.replace(
            mentionPattern,
            `<span class="${mentionClass}">@${mention.display_name}</span>`
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
        {message.attachments.map((attachment: any, index: number) => {
          const url: string = attachment.url || ''
          const name: string = attachment.name || 'arquivo'
          const path = url.split('?')[0].toLowerCase()
          const ext = (path.split('.').pop() || '').toLowerCase()

          const isImage = (attachment.type?.startsWith('image/') ?? false) ||
            ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
          const isVideo = (attachment.type?.startsWith('video/') ?? false) ||
            ['mp4', 'webm', 'mov', 'ogg', 'm4v'].includes(ext)

          if (isImage) {
            return (
              <button
                key={index}
                type="button"
                className="group relative cursor-zoom-in"
                onClick={(e) => {
                  const img = e.currentTarget.querySelector('img')
                  const currentUrl = img?.src || url
                  setPreview({ type: 'image', url: currentUrl, name })
                }}
              >
                <img
                  src={url}
                  alt={`Imagem: ${name}`}
                  className="h-32 w-auto rounded-md object-cover shadow-sm"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    const currentUrl = img.src
                    
                    if (!failedUrls.has(currentUrl) && attachment.id) {
                      // Tenta URL temporária uma vez
                      const tempPath = `temp/${attachment.id}`
                      const { data } = supabase.storage.from('message_attachments').getPublicUrl(tempPath)
                      
                      setFailedUrls(prev => new Set([...prev, currentUrl]))
                      img.src = data.publicUrl
                    } else {
                      // Fallback final
                      img.onerror = null
                      img.src = '/placeholder.svg'
                    }
                  }}
                />
              </button>
            )
          }

          if (isVideo) {
            return (
              <button
                key={index}
                type="button"
                className="group relative cursor-zoom-in"
                onClick={(e) => {
                  const video = e.currentTarget.querySelector('video')
                  const currentUrl = video?.src || url
                  setPreview({ type: 'video', url: currentUrl, name })
                }}
              >
                <video
                  src={url}
                  className="h-32 w-auto rounded-md shadow-sm"
                  muted
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    const video = e.currentTarget as HTMLVideoElement
                    const currentUrl = video.src
                    
                    if (!failedUrls.has(currentUrl) && attachment.id) {
                      // Tenta URL temporária uma vez
                      const tempPath = `temp/${attachment.id}`
                      const { data } = supabase.storage.from('message_attachments').getPublicUrl(tempPath)
                      
                      setFailedUrls(prev => new Set([...prev, currentUrl]))
                      video.src = data.publicUrl
                    }
                  }}
                />
              </button>
            )
          }

          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-2"
              download
            >
              📎 {name}
            </a>
          )
        })}
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
      
      {isCurrentUser ? (
        // Layout para mensagens próprias (direita)
        <div 
          className="group px-4 py-2 transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={(el) => registerMessageRef?.(message.id, el)}
        >
          <div className="flex justify-end">
            <div className={`transition-opacity mr-2 flex items-start pt-1 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {onReply && (
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
              )}
            </div>
            
            <div className="max-w-[70%] min-w-0">
              <div className={`bg-orange-100 text-gray-900 rounded-2xl rounded-br-md px-4 py-2 ${isHighlighted ? 'ring-2 ring-primary/50 animate-pulse' : ''}`}>
                <div className="text-xs text-gray-600 mb-1 text-right">
                  {formatTime(message.created_at)}
                  {message.edited && (
                    <span className="ml-2">editado</span>
                  )}
                </div>

                {replyToMessage && (
                  <button
                    type="button"
                    className="mb-2 w-full text-left rounded-md bg-muted/50 border-l-2 border-primary/50 px-3 py-2 hover:bg-muted/70 focus:outline-none"
                    onClick={() => onJumpToMessage?.(replyToMessage.id)}
                    aria-label="Ir para mensagem respondida"
                  >
                    <div className="text-xs font-medium text-primary mb-1">
                      {replyToMessage.display_name || 'Usuário'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {(() => {
                        const cleanText = extractCleanText(replyToMessage.content)
                        return cleanText.length > 80 ? cleanText.slice(0, 80) + '...' : cleanText
                      })()}
                    </div>
                  </button>
                )}
                
                <div className="break-words">
                  {renderContent(message.content)}
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    {renderAttachments()}
                  </div>
                )}
              </div>

              {repliesCount && repliesCount > 0 && (
                <button
                  type="button"
                  onClick={() => lastReplyId && onJumpToMessage?.(lastReplyId)}
                  className="mt-1 text-xs text-primary hover:underline ml-auto block"
                  aria-label="Ver respostas"
                >
                  {repliesCount} {repliesCount === 1 ? 'resposta' : 'respostas'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Layout para mensagens de outros (esquerda)
        <div 
          className="group hover:bg-muted/30 px-4 py-2 transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={(el) => registerMessageRef?.(message.id, el)}
        >
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={author.avatar_url || undefined} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 max-w-[70%]">
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
              </div>
              
              <div className={`bg-muted rounded-2xl rounded-bl-md px-4 py-2 ${isHighlighted ? 'ring-2 ring-primary/50 animate-pulse' : ''}`}>
                {replyToMessage && (
                  <button
                    type="button"
                    className="mb-2 w-full text-left rounded-md bg-muted/50 border-l-2 border-primary/50 px-3 py-2 hover:bg-muted/70 focus:outline-none"
                    onClick={() => onJumpToMessage?.(replyToMessage.id)}
                    aria-label="Ir para mensagem respondida"
                  >
                    <div className="text-xs font-medium text-primary mb-1">
                      {replyToMessage.display_name || 'Usuário'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {(() => {
                        const cleanText = extractCleanText(replyToMessage.content)
                        return cleanText.length > 80 ? cleanText.slice(0, 80) + '...' : cleanText
                      })()}
                    </div>
                  </button>
                )}
                <div className="text-foreground break-words">
                  {renderContent(message.content)}
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    {renderAttachments()}
                  </div>
                )}
              </div>

              {repliesCount && repliesCount > 0 && (
                <button
                  type="button"
                  onClick={() => lastReplyId && onJumpToMessage?.(lastReplyId)}
                  className="mt-1 text-xs text-primary hover:underline text-left"
                  aria-label="Ver respostas"
                >
                  {repliesCount} {repliesCount === 1 ? 'resposta' : 'respostas'}
                </button>
              )}
            </div>
            
            <div className={`transition-opacity flex items-start pt-1 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {onReply && (
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
              )}
            </div>
          </div>
        </div>
      )}

       <Dialog open={!!preview} onOpenChange={(open) => { if (!open) setPreview(null) }}>
         <DialogContent className="max-w-4xl">
           <DialogTitle className="sr-only">
             Preview de {preview?.type === 'image' ? 'Imagem' : 'Vídeo'}
           </DialogTitle>
           <DialogDescription className="sr-only">
             Visualizando anexo: {preview?.name || 'arquivo de mídia'}
           </DialogDescription>
           
           <div className="flex items-center justify-between mb-2">
             <div className="text-sm text-muted-foreground truncate">{preview?.name || 'Arquivo'}</div>
             {preview?.url && (
               <Button asChild variant="secondary" size="sm">
                 <a href={preview.url} download target="_blank" rel="noopener noreferrer">
                   <Download className="h-4 w-4 mr-1" /> Baixar
                 </a>
               </Button>
             )}
           </div>
           <div className="w-full max-h-[80vh]">
             {preview?.type === 'image' ? (
               <img
                 src={preview.url}
                 alt={preview?.name || 'Imagem'}
                 className="w-full max-h-[80vh] object-contain rounded-md"
                 onError={(e) => {
                   const img = e.currentTarget as HTMLImageElement
                   img.onerror = null
                   img.src = '/placeholder.svg'
                 }}
               />
             ) : preview?.type === 'video' ? (
               <video
                 src={preview.url}
                 className="w-full max-h-[80vh] rounded-md"
                 controls
                 playsInline
               />
             ) : null}
           </div>
         </DialogContent>
       </Dialog>
     </>
  )
}