import { Hash, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';
import type { Conversation } from '@/hooks/useConversations';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return formatTime(timestamp);
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit'
      });
    }
  };

  const getConversationUrl = () => {
    if (conversation.type === 'channel') {
      return `/channel/${conversation.id}`;
    } else {
      return `/dm/${conversation.id}`;
    }
  };

  const truncateMessage = (message: string, maxLength = 35) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <NavLink
      to={getConversationUrl()}
      className={({ isActive: navIsActive }) => cn(
        "flex items-center px-3 py-3 hover:bg-chat-list-hover cursor-pointer transition-colors border-b border-chat-list-border",
        navIsActive && "bg-chat-list-active"
      )}
    >
      {/* Avatar */}
      <div className="relative mr-3 flex-shrink-0">
        {conversation.type === 'channel' ? (
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            {conversation.name.includes('private') || conversation.name.includes('privado') ? (
              <Lock className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Hash className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
        ) : (
          <>
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online border-2 border-white rounded-full"></div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-chat-list-title truncate">
            {conversation.name}
          </h3>
          <span className={cn(
            "text-xs flex-shrink-0",
            conversation.unreadCount > 0 ? 'text-primary' : 'text-chat-list-time'
          )}>
            {formatMessageTime(conversation.lastMessageTime)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-chat-list-message truncate pr-2">
            {conversation.type === 'channel' && conversation.lastMessageUserName && (
              <span className="font-medium">
                {conversation.lastMessageUserName}: 
              </span>
            )}
            {truncateMessage(conversation.lastMessage)}
          </p>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {conversation.isMuted && (
              <span className="text-chat-list-muted text-sm">
                🔇
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </NavLink>
  );
}