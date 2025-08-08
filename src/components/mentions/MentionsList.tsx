import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Hash, User, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useMentions } from '@/hooks/useMentions';

interface MentionsListProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const MentionsList = ({ limit, showHeader = true, compact = false }: MentionsListProps) => {
  const { mentions, loading, unreadCount, markAsRead, markAllAsRead } = useMentions(limit);
  const navigate = useNavigate();

  const handleMentionClick = async (mention: typeof mentions[0]) => {
    // Marcar como lida se não estiver
    if (!mention.is_read) {
      await markAsRead(mention.id);
    }

    // Navegar para o canal/DM
    if (mention.channel) {
      navigate(`/channel/${mention.channel_id}?highlight=${mention.id}`);
    }
  };

  const getChannelIcon = (isPrivate: boolean) => {
    return isPrivate ? <User className="w-3 h-3" /> : <Hash className="w-3 h-3" />;
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Suas Menções
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mentions.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Suas Menções
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma menção encontrada</p>
            <p className="text-sm">Você será notificado quando alguém mencionar você</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Suas Menções
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-3" : ""}>
        <ScrollArea className={compact ? "h-64" : "h-80"}>
          <div className="space-y-3">
            {mentions.map((mention) => (
              <div
                key={mention.id}
                className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                  !mention.is_read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleMentionClick(mention)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={mention.author.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(mention.author.display_name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {mention.author.display_name || 'Usuário'}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {mention.channel && getChannelIcon(mention.channel.is_private)}
                      <span className="text-xs">
                        {mention.channel?.name || 'Canal'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(mention.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {truncateContent(mention.content, compact ? 80 : 120)}
                  </p>
                  
                  {!mention.is_read && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-xs font-medium text-primary">Nova</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {limit && mentions.length >= limit && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/mentions')}
            >
              Ver todas as menções
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};