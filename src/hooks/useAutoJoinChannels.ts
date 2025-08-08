import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function useAutoJoinChannels() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const autoJoinPublicChannels = async () => {
      try {
        // Buscar canais públicos onde o usuário não é membro
        const { data: publicChannels, error: channelsError } = await supabase
          .from('channels')
          .select('id, name')
          .eq('is_private', false)

        if (channelsError) {
          console.error('Error fetching public channels:', channelsError)
          return
        }

        // Verificar quais canais o usuário já é membro
        const { data: userMemberships, error: membershipsError } = await supabase
          .from('channel_members')
          .select('channel_id')
          .eq('user_id', user.id)

        if (membershipsError) {
          console.error('Error fetching user memberships:', membershipsError)
          return
        }

        const memberChannelIds = userMemberships?.map(m => m.channel_id) || []
        const channelsToJoin = publicChannels?.filter(channel => 
          !memberChannelIds.includes(channel.id)
        ) || []

        // Auto-join nos canais públicos que o usuário não é membro
        if (channelsToJoin.length > 0) {
          const membershipsToInsert = channelsToJoin.map(channel => ({
            channel_id: channel.id,
            user_id: user.id,
            role: 'member'
          }))

          const { error: insertError } = await supabase
            .from('channel_members')
            .insert(membershipsToInsert)

          if (insertError) {
            console.error('Error auto-joining channels:', insertError)
          } else {
            console.log(`Auto-joined ${channelsToJoin.length} public channels`)
          }
        }
      } catch (error) {
        console.error('Error in auto-join process:', error)
      }
    }

    // Aguardar um pouco para garantir que o perfil foi criado
    const timer = setTimeout(autoJoinPublicChannels, 2000)
    return () => clearTimeout(timer)
  }, [user])
}