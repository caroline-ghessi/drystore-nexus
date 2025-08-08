import { useRef, useEffect } from "react"
import { Hash, Lock, Loader2, Paperclip, UserPlus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserStatus } from "@/components/ui/user-status"
import { Button } from "@/components/ui/button"
import { MessageRichEditor } from "./MessageRichEditor"
import { useReplies } from "@/hooks/useReplies"
import { useMessages } from "@/hooks/useMessages"
import { useAuth } from "@/hooks/useAuth"
import { useChannels } from "@/hooks/useChannels"
import { useChannelMembership } from "@/hooks/useChannelMembership"

interface ChatAreaProps {
  channelId: string
  channelName: string
  isPrivate?: boolean
  isDM?: boolean
}

export function ChatArea({ channelId, channelName, isPrivate = false, isDM = false }: ChatAreaProps) {
  const { messages, loading, sendMessage } = useMessages(channelId)
  const { user } = useAuth()
  const { startReply } = useReplies()
  const { joinChannel } = useChannels()
  const { isMember, loading: membershipLoading, setIsMember } = useChannelMembership(channelId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (content: string, attachments?: any[], replyToId?: string, mentions?: any[]) => {
    sendMessage(content, attachments, replyToId, mentions)
  }

  const handleJoinChannel = async () => {
    const success = await joinChannel(channelId)
    if (success) {
      setIsMember(true)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Slack-style Header */}
      <div className="border-b border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isPrivate ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Hash className="h-5 w-5 text-muted-foreground" />
              )}
              <h1 className="text-xl font-bold text-foreground">
                {isDM ? channelName : channelName}
              </h1>
            </div>
            {!isDM && (
              <div className="text-sm text-muted-foreground">
                {isPrivate ? "🔒 Canal privado" : "Público"}
              </div>
            )}
          </div>
          
          {isDM && (
            <UserStatus 
              name=""
              status="online"
            />
          )}
        </div>
        
        {!isDM && (
          <p className="text-sm text-muted-foreground mt-2">
            {isPrivate 
              ? "Este canal é privado. Apenas membros específicos podem visualizar e participar."
              : "Canal público da equipe Drystore"
            }
          </p>
        )}
      </div>

      {/* Messages Area - Slack style */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4">
          {loading || membershipLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !isDM && isMember === false && !isPrivate ? (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Você não é membro deste canal
                </h3>
                <p className="text-muted-foreground mb-4">
                  Este é um canal público. Clique no botão abaixo para entrar e participar das conversas.
                </p>
                <Button onClick={handleJoinChannel} className="mx-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Entrar no Canal
                </Button>
              </div>
            </div>
          ) : !isDM && isMember === false && isPrivate ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Canal Privado</h3>
              <p>Este canal é privado. Você precisa ser convidado para participar.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm mt-1">Seja o primeiro a escrever algo!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.created_at) !== formatDate(messages[index - 1].created_at)
              
              const isOwn = message.user_id === user?.id
              const authorName = isOwn ? 'Você' : 'Usuário'
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  {/* Slack-style linear message layout */}
                  <div className="flex space-x-3 hover:bg-muted/30 py-2 px-3 -mx-3 rounded group">
                    {/* Avatar always on the left */}
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and timestamp row */}
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-muted-foreground">(editado)</span>
                        )}
                      </div>
                      
                      {/* Message text */}
                      <div 
                        className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content_type === 'rich' 
                            ? message.content 
                            : message.content.replace(/\n/g, '<br/>') 
                        }}
                      />
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                              <Paperclip className="w-3 h-3" />
                              <span className="flex-1 truncate">{attachment.name}</span>
                              <span className="text-muted-foreground">
                                {attachment.size ? `${Math.round(attachment.size / 1024)}KB` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                     {/* Reply button on hover */}
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                         onClick={() => startReply({
                           id: message.id,
                           content: message.content,
                           user_id: message.user_id,
                           display_name: authorName,
                           avatar_url: null,
                           created_at: message.created_at
                         })}
                         className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                       >
                         ↩️
                       </button>
                     </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="px-6 pb-6">
        {(!isDM && isMember === false) ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {isPrivate 
              ? "Você precisa ser membro para enviar mensagens neste canal privado."
              : "Entre no canal para enviar mensagens."
            }
          </div>
        ) : (
          <MessageRichEditor
            onSendMessage={handleSendMessage}
            placeholder={`Mensagem ${isDM ? channelName : `#${channelName}`}`}
            channelId={channelId}
          />
        )}
      </div>
    </div>
  )
}