import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity as ActivityIcon, MessageCircle, FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "message" | "document" | "channel" | "user";
  title: string;
  description: string;
  user_name: string;
  created_at: string;
  metadata?: any;
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalDocuments: 0,
    totalChannels: 0,
    activeUsers: 0
  });

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      // Buscar atividades recentes de diferentes tabelas
      const [messagesResult, documentsResult, channelsResult] = await Promise.all([
        // Mensagens recentes
        supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            channel_id,
            user_id
          `)
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Documentos criados recentemente
        supabase
          .from("documents")
          .select(`
            id,
            title,
            created_at,
            created_by
          `)
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Canais criados recentemente
        supabase
          .from("channels")
          .select(`
            id,
            name,
            created_at,
            created_by
          `)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      const combinedActivities: ActivityItem[] = [];

      // Processar mensagens
      if (messagesResult.data) {
        messagesResult.data.forEach(msg => {
          combinedActivities.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: "Nova mensagem",
            description: msg.content.substring(0, 100) + (msg.content.length > 100 ? "..." : ""),
            user_name: "Usuário",
            created_at: msg.created_at
          });
        });
      }

      // Processar documentos
      if (documentsResult.data) {
        documentsResult.data.forEach(doc => {
          combinedActivities.push({
            id: `doc-${doc.id}`,
            type: "document",
            title: "Documento criado",
            description: doc.title,
            user_name: "Usuário",
            created_at: doc.created_at
          });
        });
      }

      // Processar canais
      if (channelsResult.data) {
        channelsResult.data.forEach(channel => {
          combinedActivities.push({
            id: `channel-${channel.id}`,
            type: "channel",
            title: "Canal criado",
            description: channel.name,
            user_name: "Usuário",
            created_at: channel.created_at
          });
        });
      }

      // Ordenar por data
      combinedActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(combinedActivities.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [messagesCount, documentsCount, channelsCount, profilesCount] = await Promise.all([
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("documents").select("*", { count: "exact", head: true }),
        supabase.from("channels").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true })
      ]);

      setStats({
        totalMessages: messagesCount.count || 0,
        totalDocuments: documentsCount.count || 0,
        totalChannels: channelsCount.count || 0,
        activeUsers: profilesCount.count || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "channel":
        return <Users className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case "message":
        return "default";
      case "document":
        return "secondary";
      case "channel":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Atividades</h1>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensagens</p>
                <p className="text-2xl font-semibold">{stats.totalMessages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documentos</p>
                <p className="text-2xl font-semibold">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canais</p>
                <p className="text-2xl font-semibold">{stats.totalChannels}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-semibold">{stats.activeUsers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {activity.description}
                  </p>
                  
                  <p className="text-xs text-primary mt-1">
                    por {activity.user_name}
                  </p>
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8">
                <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-muted-foreground">
                  As atividades recentes aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}