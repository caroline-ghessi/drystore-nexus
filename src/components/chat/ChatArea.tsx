import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Hash, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isPrivate ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Hash className="h-5 w-5 text-muted-foreground" />
            )}
            <h1 className="text-xl font-semibold text-card-foreground">
              {isDM ? channelName : `# ${channelName}`}
            </h1>
          </div>
          {isDM && (
            <UserStatus 
              name=""
              status="online"
              className="ml-auto"
            />
          )}
        </div>
        {!isDM && (
          <p className="text-sm text-muted-foreground mt-1">
            {isPrivate 
              ? "Canal privado - apenas membros autorizados podem ver esta conversa" 
              : "Canal público - toda a equipe pode participar"
            }
          </p>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
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
                
                <div className={`flex space-x-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!message.isOwn && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                      {message.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${message.isOwn ? 'order-first' : ''}`}>
                    {!message.isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-card-foreground">
                          {message.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-lg ${
                      message.isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.isOwn && (
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {formatTime(message.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.isOwn && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                      V
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Enviar mensagem para ${isDM ? channelName : `#${channelName}`}`}
              className="pr-20 bg-chat-input border-input focus:ring-ring"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}