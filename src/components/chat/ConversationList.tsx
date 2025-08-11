import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from './ConversationItem';
import { Input } from '@/components/ui/input';

export function ConversationList() {
  const { conversations, loading, searchConversations } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = searchConversations(searchTerm);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="bg-chat-header px-4 py-3 border-b border-chat-list-border">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar ou começar uma nova conversa"
                className="pl-10 pr-4 py-2 bg-background rounded-full text-sm placeholder:text-muted-foreground"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-chat-header px-4 py-3 border-b border-chat-list-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar ou começar uma nova conversa"
              className="pl-10 pr-4 py-2 bg-background rounded-full text-sm placeholder:text-muted-foreground focus:outline-none border-0 focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={`${conversation.type}-${conversation.id}`}
              conversation={conversation}
            />
          ))
        )}
      </div>
    </div>
  );
}