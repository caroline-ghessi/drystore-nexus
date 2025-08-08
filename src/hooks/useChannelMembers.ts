import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ChannelMember {
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

export function useChannelMembers(channelId: string) {
  const [members, setMembers] = useState<ChannelMember[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!channelId) return

    const fetchMembers = async () => {
      console.log('Iniciando carregamento de membros para canal:', channelId)
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_channel_members', {
          channel_id: channelId
        })

        if (error) throw error
        console.log('Membros carregados:', data?.length || 0, 'membros')
        setMembers(data || [])
      } catch (error) {
        console.error('Error fetching channel members:', error)
        setMembers([])
      } finally {
        setLoading(false)
        console.log('Carregamento de membros finalizado')
      }
    }

    fetchMembers()
  }, [channelId])

  const searchMembers = (query: string) => {
    console.log('searchMembers chamado com query:', query, 'membros disponíveis:', members.length)
    
    if (!query) return members
    
    const filteredMembers = members.filter(member => {
      const name = member.display_name?.toLowerCase() || ''
      const userId = member.user_id.toLowerCase()
      const queryLower = query.toLowerCase()
      
      return name.includes(queryLower) || userId.includes(queryLower)
    })
    
    console.log('Membros filtrados:', filteredMembers)
    return filteredMembers
  }

  return {
    members,
    loading,
    searchMembers
  }
}