import { useState } from 'react';
import { Hash, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ConversationList } from '@/components/chat/ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ConversationTabProps {
  searchTerm: string;
}

export function ConversationTab({ searchTerm }: ConversationTabProps) {
  const { conversations, loading } = useConversations();
  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);
  const navigate = useNavigate();

  const channels = conversations.filter(c => c.type === 'channel');
  const directMessages = conversations.filter(c => c.type === 'dm');

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-sidebar-muted-foreground">
          Carregando conversas...
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Channels Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowChannels(!showChannels)}
          className="flex items-center justify-between w-full px-4 py-2 
                   hover:bg-sidebar-accent transition-colors group"
        >
          <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
            Canais ({channels.length})
          </span>
          <div className="flex items-center gap-2">
            <Plus 
              className="w-4 h-4 text-sidebar-muted-foreground hover:text-sidebar-primary 
                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/messages');
              }}
            />
            {showChannels ? (
              <ChevronDown className="w-4 h-4 text-sidebar-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-muted-foreground" />
            )}
          </div>
        </button>
        
        {showChannels && (
          <div className="space-y-0.5">
            {channels
              .filter(channel => 
                !searchTerm || 
                channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (channel.lastMessage && channel.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => navigate(`/channel/${channel.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 
                           hover:bg-sidebar-accent transition-colors group text-left"
                >
                  <div className="w-8 h-8 bg-sidebar-accent rounded-lg 
                                flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-sidebar-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {channel.name}
                      </p>
                      {channel.lastMessageTime && (
                        <span className="text-xs text-sidebar-muted-foreground flex-shrink-0 ml-2">
                          {new Date(channel.lastMessageTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sidebar-muted-foreground truncate">
                      {channel.lastMessage || 'Nenhuma mensagem'}
                    </p>
                  </div>
                  {channel.unreadCount > 0 && (
                    <span className="bg-sidebar-primary text-sidebar-primary-foreground text-xs 
                                   rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0">
                      {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            
            {channels.length === 0 && (
              <p className="text-sm text-sidebar-muted-foreground px-4 py-2">
                Nenhum canal ainda
              </p>
            )}
          </div>
        )}
      </div>

      {/* Direct Messages Section */}
      <div>
        <button
          onClick={() => setShowDMs(!showDMs)}
          className="flex items-center justify-between w-full px-4 py-2 
                   hover:bg-sidebar-accent transition-colors group"
        >
          <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
            Conversas Diretas ({directMessages.length})
          </span>
          <div className="flex items-center gap-2">
            <Plus 
              className="w-4 h-4 text-sidebar-muted-foreground hover:text-sidebar-primary 
                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/messages');
              }}
            />
            {showDMs ? (
              <ChevronDown className="w-4 h-4 text-sidebar-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-sidebar-muted-foreground" />
            )}
          </div>
        </button>
        
        {showDMs && (
          <div className="space-y-0.5">
            {directMessages
              .filter(dm => 
                !searchTerm || 
                dm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dm.lastMessage && dm.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => navigate(`/dm/${dm.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 
                           hover:bg-sidebar-accent transition-colors group text-left"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={dm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dm.name)}&background=F97316&color=fff`}
                      alt={dm.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-online 
                                  border border-sidebar-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {dm.name}
                      </p>
                      {dm.lastMessageTime && (
                        <span className="text-xs text-sidebar-muted-foreground flex-shrink-0 ml-2">
                          {new Date(dm.lastMessageTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sidebar-muted-foreground truncate">
                      {dm.lastMessage || 'Conversa direta'}
                    </p>
                  </div>
                  {dm.unreadCount > 0 && (
                    <span className="bg-sidebar-primary text-sidebar-primary-foreground text-xs 
                                   rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0">
                      {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            
            {directMessages.length === 0 && (
              <p className="text-sm text-sidebar-muted-foreground px-4 py-2">
                Nenhuma conversa
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}