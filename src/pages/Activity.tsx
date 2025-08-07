import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity as ActivityIcon, MessageCircle, FileText, Users, Calendar, TrendingUp, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DrystoreCube } from "@/components/drystore/DrystoreCube";

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
    <div className="min-h-screen bg-muted">
      {/* Header da Página com Identidade Drystore */}
      <div className="bg-background border-b border-border px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-medium">
              <ActivityIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Atividades</h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe toda a movimentação do portal interno Drystore
          </p>
        </div>
      </div>

      {/* Cards de Métricas com Design Drystore */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stats.totalMessages}</span>
              </div>
              <p className="text-sm text-muted-foreground">Mensagens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stats.totalDocuments}</span>
              </div>
              <p className="text-sm text-muted-foreground">Documentos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stats.totalChannels}</span>
              </div>
              <p className="text-sm text-muted-foreground">Canais</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stats.activeUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline de Atividades com Design Melhorado */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Card className="bg-background shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex-shrink-0 mt-1">
                    <Badge variant={getActivityBadgeVariant(activity.type)} className="p-2">
                      {getActivityIcon(activity.type)}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
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
                    
                    <p className="text-xs text-primary mt-1 font-medium">
                      por {activity.user_name}
                    </p>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-12">
                  {/* Ilustração com o Cubo Drystore */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <DrystoreCube size="xl" animated />
                      <ActivityIcon className="absolute inset-0 m-auto w-12 h-12 text-background z-10" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Nenhuma atividade encontrada
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Quando você começar a interagir com o portal, todas as atividades 
                    aparecerão aqui em tempo real
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-full px-6">
                      <Search className="w-4 h-4 mr-2" />
                      Explorar Portal
                    </Button>
                    <Button variant="outline" className="border-2 border-primary text-primary hover:bg-orange-50 rounded-full px-6">
                      <Plus className="w-4 h-4 mr-2" />
                      Ver Tutorial
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}