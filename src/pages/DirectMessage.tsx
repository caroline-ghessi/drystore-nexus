import { useParams } from "react-router-dom"
import { ChatArea } from "@/components/chat/ChatArea"

// Mock DM data - será substituído por dados reais
const dmData: Record<string, { name: string; status: string }> = {
  "joao": { name: "João Silva", status: "online" },
  "maria": { name: "Maria Santos", status: "away" },
  "pedro": { name: "Pedro Costa", status: "offline" },
}

export default function DirectMessage() {
  const { userId } = useParams<{ userId: string }>()
  
  if (!userId || !dmData[userId]) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Usuário não encontrado
          </h2>
          <p className="text-muted-foreground">
            O usuário que você está procurando não existe ou não está disponível.
          </p>
        </div>
      </div>
    )
  }

  const user = dmData[userId]

  return (
    <div className="h-full">
      <ChatArea 
        channelId={userId}
        channelName={user.name}
        isPrivate={false}
        isDM={true}
      />
    </div>
  )
}