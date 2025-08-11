import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAdminAccess } from '@/hooks/useAdminAccess'
import { useToast } from '@/hooks/use-toast'

export interface Channel {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
  is_member?: boolean // Adicionar flag para indicar se é membro
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { isAdmin } = useAdminAccess()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setChannels(data || [])
      } catch (error) {
        console.error('Error loading channels:', error)
        toast({
          title: "Erro ao carregar canais",
          description: "Não foi possível carregar a lista de canais.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChannels()
  }, [user, toast])

  const createChannel = async (name: string, description?: string, isPrivate: boolean = false) => {
    if (!user || !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar canais.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name,
          description,
          is_private: isPrivate,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as channel member
      await supabase
        .from('channel_members')
        .insert({
          channel_id: data.id,
          user_id: user.id,
          role: 'admin'
        })

      setChannels(prev => [...prev, data])
      
      toast({
        title: "Canal criado",
        description: `O canal #${name} foi criado com sucesso.`,
      })

      return data
    } catch (error) {
      console.error('Error creating channel:', error)
      toast({
        title: "Erro ao criar canal",
        description: "Não foi possível criar o canal. Tente novamente.",
        variant: "destructive",
      })
      return null
    }
  }

  const joinChannel = async (channelId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id
        })

      if (error) throw error

      // Atualizar estado local
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, is_member: true }
          : channel
      ))

      toast({
        title: "Canal entrado",
        description: "Você entrou no canal com sucesso.",
      })

      return true
    } catch (error) {
      console.error('Error joining channel:', error)
      toast({
        title: "Erro ao entrar no canal",
        description: "Não foi possível entrar no canal. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }

  const checkChannelMembership = async (channelId: string) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking membership:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking membership:', error)
      return false
    }
  }

  return {
    channels,
    loading,
    createChannel,
    joinChannel,
    checkChannelMembership
  }
}