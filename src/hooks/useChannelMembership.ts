import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function useChannelMembership(channelId: string) {
  const [isMember, setIsMember] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !channelId) {
      setLoading(false)
      return
    }

    const checkMembership = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members')
          .select('id')
          .eq('channel_id', channelId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking membership:', error)
          setIsMember(false)
        } else {
          setIsMember(!!data)
        }
      } catch (error) {
        console.error('Error checking membership:', error)
        setIsMember(false)
      } finally {
        setLoading(false)
      }
    }

    checkMembership()
  }, [user, channelId])

  return { isMember, loading, setIsMember }
}