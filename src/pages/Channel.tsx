import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ChatArea } from "@/components/chat/ChatArea"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

interface Channel {
  id: string
  name: string
  is_private: boolean
}

export default function Channel() {
  const { channelId } = useParams<{ channelId: string }>()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!channelId) return

    const fetchChannel = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .single()

        if (error) throw error
        setChannel(data)
      } catch (error) {
        console.error('Error fetching channel:', error)
        setError('Canal não encontrado')
      } finally {
        setLoading(false)
      }
    }

    fetchChannel()
  }, [channelId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Canal não encontrado
          </h2>
          <p className="text-muted-foreground">
            O canal que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatArea 
        channelId={channelId}
        channelName={channel.name}
        isPrivate={channel.is_private}
        isDM={false}
      />
    </div>
  )
}