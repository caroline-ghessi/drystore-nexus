import { useRef, useEffect, useState } from "react"
import { Hash, Lock, Loader2, UserPlus, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserStatus } from "@/components/ui/user-status"
import { Button } from "@/components/ui/button"
import { MessageRichEditor } from "./MessageRichEditor"
import { MessageItem } from "./MessageItem"
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
  const viewportRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
      setShowScrollToBottom(distanceFromBottom > 100)
    }
    el.addEventListener('scroll', onScroll)
    onScroll()
    return () => {
      el.removeEventListener('scroll', onScroll)
    }
  }, [viewportRef, messages.length])

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
    <div className="flex flex-col h-full bg-chat-background relative">
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
      <ScrollArea className="flex-1 px-6" viewportRef={viewportRef}>
        <div className="py-4 pb-28">
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
              const showDateSeparator = index === 0 || 
                formatDate(message.created_at) !== formatDate(messages[index - 1].created_at)
              
              const isCurrentUser = message.user_id === user?.id
              
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  author={message.author}
                  replyToMessage={message.replyToMessage}
                  currentUserId={user?.id}
                  onReply={startReply}
                  showDateSeparator={showDateSeparator}
                  isCurrentUser={isCurrentUser}
                />
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {showScrollToBottom && (
        <div className="absolute bottom-28 right-6 z-50">
          <Button size="icon" className="rounded-full shadow-lg" onClick={scrollToBottom} aria-label="Ir para as mensagens mais recentes">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}


      {/* Message Input */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t px-6 pb-6 pt-3">
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