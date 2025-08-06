import { useParams } from "react-router-dom"
import { ChatArea } from "@/components/chat/ChatArea"

// Mock channel data - será substituído por dados reais
const channelData: Record<string, { name: string; isPrivate: boolean }> = {
  "geral": { name: "geral", isPrivate: false },
  "anuncios": { name: "anúncios", isPrivate: false },
  "desenvolvimento": { name: "desenvolvimento", isPrivate: false },
  "marketing": { name: "marketing", isPrivate: true },
  "rh": { name: "recursos-humanos", isPrivate: true },
}

export default function Channel() {
  const { channelId } = useParams<{ channelId: string }>()
  
  if (!channelId || !channelData[channelId]) {
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

  const channel = channelData[channelId]

  return (
    <div className="h-full">
      <ChatArea 
        channelId={channelId}
        channelName={channel.name}
        isPrivate={channel.isPrivate}
        isDM={false}
      />
    </div>
  )
}