import { useState, useEffect } from "react"
import { Search, MessageCircle, Hash, Lock, Users, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { CreateChannelModal } from "@/components/modals/CreateChannelModal"

interface Channel {
  id: string
  name: string
  is_private: boolean
  created_at: string
  description?: string
}

interface Profile {
  id: string
  user_id: string
  display_name: string
  avatar_url?: string
  status?: string
}

export default function Messages() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchChannels()
      fetchProfiles()
    }
  }, [user])

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('name')
    
    if (data) setChannels(data)
  }

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id)
    
    if (data) setProfiles(data)
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProfiles = profiles.filter(profile =>
    profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Central de Conversas</h1>
          <p className="text-primary-foreground/80 mb-8">
            Acesse todos os canais e conversas diretas em um só lugar
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              className="pl-12 pr-4 py-4 text-lg bg-background text-foreground"
              placeholder="Buscar canais ou pessoas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          
          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Button 
              onClick={() => setCreateChannelOpen(true)}
              className="flex-1 h-16"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Canal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dm/new')}
              className="flex-1 h-16"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Nova Conversa
            </Button>
          </div>

          {/* Channels Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Canais
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredChannels.length} canal(is)
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map((channel) => (
                <Card 
                  key={channel.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/channel/${channel.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      {channel.is_private ? (
                        <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                      ) : (
                        <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                      )}
                      {channel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Criado em {new Date(channel.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {channel.is_private && (
                        <Badge variant="secondary">Privado</Badge>
                      )}
                    </div>
                    {channel.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {channel.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Conversas Diretas
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProfiles.length} pessoa(s)
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <Card 
                  key={profile.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/dm/${profile.user_id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {(profile.display_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          profile.status === 'online' ? 'bg-status-online' :
                          profile.status === 'away' ? 'bg-status-away' :
                          profile.status === 'busy' ? 'bg-status-busy' :
                          'bg-status-offline'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.display_name || 'Usuário'}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {profile.status || 'offline'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateChannelModal 
        open={createChannelOpen} 
        onOpenChange={setCreateChannelOpen}
        onChannelCreated={fetchChannels}
      />
    </div>
  )
}