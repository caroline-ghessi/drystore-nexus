import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Hash, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserStatus } from "@/components/ui/user-status"

interface Message {
  id: string
  content: string
  author: string
  timestamp: Date
  isOwn: boolean
  avatar?: string
}

interface ChatAreaProps {
  channelId: string
  channelName: string
  isPrivate?: boolean
  isDM?: boolean
}

// Mock messages data
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Bom dia pessoal! Como estão as vendas de hoje?",
    author: "João Silva",
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false
  },
  {
    id: "2", 
    content: "Oi João! As vendas estão ótimas hoje, já batemos 80% da meta diária.",
    author: "Você",
    timestamp: new Date(Date.now() - 3000000),
    isOwn: true
  },
  {
    id: "3",
    content: "Que ótima notícia! Vamos conseguir fechar o mês muito bem 🎉",
    author: "Maria Santos",
    timestamp: new Date(Date.now() - 2400000),
    isOwn: false
  },
  {
    id: "4",
    content: "Pessoal, deixei o relatório de vendas na pasta compartilhada. Deem uma olhada quando puderem.",
    author: "Pedro Costa", 
    timestamp: new Date(Date.now() - 1800000),
    isOwn: false
  },
  {
    id: "5",
    content: "Obrigado Pedro! Já vou dar uma conferida nos números.",
    author: "Você",
    timestamp: new Date(Date.now() - 900000),
    isOwn: true
  }
]

export function ChatArea({ channelId, channelName, isPrivate = false, isDM = false }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      author: "Você",
      timestamp: new Date(),
      isOwn: true
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
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
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                
                {/* Slack-style linear message layout */}
                <div className="flex space-x-3 hover:bg-muted/30 py-2 px-3 -mx-3 rounded group">
                  {/* Avatar always on the left */}
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                    {message.isOwn ? 'V' : message.author.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and timestamp row */}
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {message.isOwn ? 'Você' : message.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Message text */}
                    <div className="text-sm text-foreground leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Actions on hover (hidden for now, Slack-style) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Espaço para futuras ações como reações, responder, etc. */}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Slack-style Message Input */}
      <div className="px-6 pb-6">
        <form onSubmit={handleSendMessage}>
          <div className="relative">
            {/* Formatting toolbar */}
            <div className="flex items-center space-x-1 p-2 border border-input rounded-t-lg bg-background">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Negrito"
              >
                <span className="text-sm font-bold">B</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Itálico"
              >
                <span className="text-sm italic">I</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Anexar arquivo"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Message input */}
            <div className="relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Mensagem ${isDM ? channelName : `#${channelName}`}`}
                className="rounded-t-none rounded-b-lg border-t-0 bg-background pr-12 py-3 min-h-[44px] max-h-[120px] resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e as any)
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                size="sm"
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}