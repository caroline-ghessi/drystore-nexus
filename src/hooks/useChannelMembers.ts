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
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_channel_members', {
          channel_id: channelId
        })

        if (error) throw error
        setMembers(data || [])
      } catch (error) {
        console.error('Error fetching channel members:', error)
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [channelId])

  const searchMembers = (query: string) => {
    if (!query) return members
    
    return members.filter(member => 
      member.display_name?.toLowerCase().includes(query.toLowerCase()) ||
      member.user_id.toLowerCase().includes(query.toLowerCase())
    )
  }

  return {
    members,
    loading,
    searchMembers
  }
}