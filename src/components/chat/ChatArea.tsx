import { useRef, useEffect, useState, useMemo } from "react"
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

  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const registerMessageRef = (id: string, el: HTMLDivElement | null) => {
    const map = messageRefs.current
    if (el) map.set(id, el)
    else map.delete(id)
  }

  const onJumpToMessage = (id: string) => {
    const el = messageRefs.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedId(id)
      window.setTimeout(() => {
        setHighlightedId((prev) => (prev === id ? null : prev))
      }, 1600)
    }
  }

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

  const replyInfo = useMemo(() => {
    const map = new Map<string, { count: number; lastId: string }>()
    for (const m of messages) {
      const parentId = (m as any).reply_to_id as string | undefined
      if (parentId) {
        const info = map.get(parentId) || { count: 0, lastId: '' }
        info.count += 1
        info.lastId = m.id
        map.set(parentId, info)
      }
    }
    return map
  }, [messages])

  return (
    <div 
      className="flex flex-col h-full bg-chat-background relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='%23e5ddd5'/%3E%3Cpath d='M0 0l40 40M40 0L0 40' stroke='%23d4cfc7' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }}
    >
      {/* WhatsApp-style Header */}
      <div className="border-b border-gray-300 px-4 py-2 bg-chat-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar do Canal/Usuário */}
            <div className="relative">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                {isDM ? (
                  <span className="text-white font-semibold text-lg">
                    {channelName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Hash className="w-6 h-6 text-white" />
                )}
              </div>
              {isDM && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online border-2 border-white rounded-full"></div>
              )}
            </div>
            
            {/* Info do Canal */}
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                {isDM ? channelName : `#${channelName}`}
              </h2>
              <p className="text-xs text-gray-600">
                {isDM 
                  ? "Última visualização há 5 min" 
                  : isPrivate 
                    ? "🔒 Canal privado da equipe"
                    : "Canal público da equipe Drystore"
                }
              </p>
            </div>
          </div>
          
          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              📹
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              📞
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              🔍
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              ⋮
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp style */}
      <ScrollArea className="flex-1 px-4" viewportRef={viewportRef}>
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
              const info = replyInfo.get(message.id)
              
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
                  repliesCount={info?.count}
                  lastReplyId={info?.lastId}
                  onJumpToMessage={onJumpToMessage}
                  registerMessageRef={registerMessageRef}
                  isHighlighted={highlightedId === message.id}
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


      {/* Message Input - WhatsApp style */}
      <div className="sticky bottom-0 z-10 bg-chat-input border-t border-gray-300 px-4 py-3">
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