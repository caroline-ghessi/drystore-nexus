import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export interface Message {
  id: string
  content: string
  user_id: string
  channel_id: string
  created_at: string
  updated_at: string
  edited: boolean
  attachments?: any[]
  content_type?: string
}

export function useMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load messages
  useEffect(() => {
    if (!channelId) return

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages((data || []).map(msg => ({
          ...msg,
          attachments: Array.isArray(msg.attachments) ? msg.attachments : []
        })))
      } catch (error) {
        console.error('Error loading messages:', error)
        toast({
          title: "Erro ao carregar mensagens",
          description: "Não foi possível carregar as mensagens do canal.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [channelId, toast])

  // Setup realtime subscription
  useEffect(() => {
    if (!channelId) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId])

  const sendMessage = async (content: string, attachments?: any[]) => {
    if (!user || (!content.trim() && (!attachments || attachments.length === 0))) return

    try {
      // Create the message first to get the ID
      const messageData: any = {
        content: content.trim() || '',
        user_id: user.id,
        channel_id: channelId,
        content_type: content.includes('<') ? 'rich' : 'text'
      }

      if (attachments && attachments.length > 0) {
        messageData.attachments = attachments
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) throw error

      // If there are attachments, move them from temp folder to message folder
      if (attachments && attachments.length > 0 && newMessage) {
        for (const attachment of attachments) {
          const oldPath = `temp/${attachment.id}`
          const newPath = `${newMessage.id}/${attachment.id}`
          
          // Move file to message-specific folder
          await supabase.storage
            .from('message_attachments')
            .move(oldPath, newPath)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const updateMessage = async (messageId: string, content: string) => {
    if (!user || !content.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: content.trim(),
          edited: true
        })
        .eq('id', messageId)
        .eq('user_id', user.id) // Only allow editing own messages

      if (error) throw error
    } catch (error) {
      console.error('Error updating message:', error)
      toast({
        title: "Erro ao editar mensagem",
        description: "Não foi possível editar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    updateMessage
  }
}