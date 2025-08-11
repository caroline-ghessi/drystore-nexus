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
import { extractCleanText } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "message" | "document" | "channel" | "user";
  title: string;
  description: string;
  user_name: string;
  user_id: string;
  avatar_url?: string;
  created_at: string;
  metadata?: any;
}

interface UserActivities {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  activities: ActivityItem[];
  count: number;
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivities[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
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
      // Buscar atividades recentes de diferentes tabelas com perfis dos usuários
      const [messagesResult, documentsResult, channelsResult] = await Promise.all([
        // Mensagens recentes com perfil do usuário
        supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            channel_id,
            user_id,
            profiles!inner(
              display_name,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false })
          .limit(20),
        
        // Documentos criados recentemente com perfil do usuário
        supabase
          .from("documents")
          .select(`
            id,
            title,
            created_at,
            created_by,
            profiles!inner(
              display_name,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false })
          .limit(20),
        
        // Canais criados recentemente com perfil do usuário
        supabase
          .from("channels")
          .select(`
            id,
            name,
            created_at,
            created_by,
            profiles!inner(
              display_name,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      const combinedActivities: ActivityItem[] = [];

      // Processar mensagens
      if (messagesResult.data) {
        messagesResult.data.forEach((msg: any) => {
          const cleanContent = extractCleanText(msg.content);
          const description = cleanContent.length > 100 
            ? cleanContent.substring(0, 100) + "..." 
            : cleanContent || "Mensagem sem conteúdo";
            
          combinedActivities.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: "Nova mensagem",
            description,
            user_name: msg.profiles?.display_name || "Usuário",
            user_id: msg.user_id,
            avatar_url: msg.profiles?.avatar_url,
            created_at: msg.created_at
          });
        });
      }

      // Processar documentos
      if (documentsResult.data) {
        documentsResult.data.forEach((doc: any) => {
          combinedActivities.push({
            id: `doc-${doc.id}`,
            type: "document",
            title: "Documento criado",
            description: doc.title,
            user_name: doc.profiles?.display_name || "Usuário",
            user_id: doc.created_by,
            avatar_url: doc.profiles?.avatar_url,
            created_at: doc.created_at
          });
        });
      }

      // Processar canais
      if (channelsResult.data) {
        channelsResult.data.forEach((channel: any) => {
          combinedActivities.push({
            id: `channel-${channel.id}`,
            type: "channel",
            title: "Canal criado",
            description: channel.name,
            user_name: channel.profiles?.display_name || "Usuário",
            user_id: channel.created_by,
            avatar_url: channel.profiles?.avatar_url,
            created_at: channel.created_at
          });
        });
      }

      // Ordenar por data
      combinedActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(combinedActivities.slice(0, 40));
      
      // Agrupar atividades por usuário
      const userActivitiesMap = new Map<string, UserActivities>();
      
      combinedActivities.slice(0, 40).forEach(activity => {
        if (!userActivitiesMap.has(activity.user_id)) {
          userActivitiesMap.set(activity.user_id, {
            user_id: activity.user_id,
            user_name: activity.user_name,
            avatar_url: activity.avatar_url,
            activities: [],
            count: 0
          });
        }
        
        const userActivity = userActivitiesMap.get(activity.user_id)!;
        userActivity.activities.push(activity);
        userActivity.count++;
      });
      
      // Converter para array e ordenar por número de atividades
      const sortedUserActivities = Array.from(userActivitiesMap.values())
        .sort((a, b) => b.count - a.count);
      
      setUserActivities(sortedUserActivities);
      
      // Expandir automaticamente o usuário mais ativo
      if (sortedUserActivities.length > 0) {
        setExpandedUsers(new Set([sortedUserActivities[0].user_id]));
      }
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

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
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
            <div className="space-y-6">
              {userActivities.map((userActivity) => (
                <Collapsible 
                  key={userActivity.user_id}
                  open={expandedUsers.has(userActivity.user_id)}
                  onOpenChange={() => toggleUserExpanded(userActivity.user_id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-border hover:border-primary/30">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userActivity.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {userActivity.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            {userActivity.user_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {userActivity.count} {userActivity.count === 1 ? 'atividade' : 'atividades'}
                            </Badge>
                            {expandedUsers.has(userActivity.user_id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Última atividade: {formatDistanceToNow(new Date(userActivity.activities[0].created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-6 mt-3 space-y-3 border-l-2 border-muted pl-6">
                      {userActivity.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all duration-200">
                          <div className="flex-shrink-0 mt-1">
                            <Badge variant={getActivityBadgeVariant(activity.type)} className="p-1.5">
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              
              {userActivities.length === 0 && (
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