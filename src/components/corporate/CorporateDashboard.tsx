import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MentionsList } from '@/components/mentions/MentionsList';
import { usePersonalMetrics } from '@/hooks/usePersonalMetrics';
import { usePendingTasks } from '@/hooks/usePendingTasks';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  FileText, 
  Clock, 
  Target,
  Calendar,
  Award,
  Bell,
  ArrowRight,
  CheckSquare,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-xs ${trendColor} flex items-center gap-1 mt-1`}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnnouncementItem {
  id: string;
  title: string;
  excerpt: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function CorporateDashboard() {
  const { metrics, loading: metricsLoading, isAdmin } = usePersonalMetrics();
  const { tasks: pendingTasks, loading: tasksLoading, getTasksByPriority } = usePendingTasks();
  
  const defaultMetrics = [
    {
      title: 'Colaboradores Ativos',
      value: '284',
      change: '+12% este mês',
      trend: 'up' as const,
      icon: <Users className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mensagens Hoje',
      value: '1,847',
      change: '+8% vs ontem',
      trend: 'up' as const,
      icon: <MessageCircle className="w-5 h-5 text-primary" />
    },
    {
      title: 'Documentos Atualizados',
      value: '23',
      change: '5 esta semana',
      trend: 'neutral' as const,
      icon: <FileText className="w-5 h-5 text-primary" />
    },
    {
      title: 'Tempo Resposta Médio',
      value: '2.3h',
      change: '-15% vs semana passada',
      trend: 'up' as const,
      icon: <Clock className="w-5 h-5 text-primary" />
    }
  ];

  const recentAnnouncements: AnnouncementItem[] = [
    {
      id: '1',
      title: 'Nova Política de Home Office',
      excerpt: 'Atualização nas diretrizes de trabalho remoto para 2024...',
      priority: 'high',
      timestamp: '2 horas atrás',
      read: false
    },
    {
      id: '2',
      title: 'Manutenção Programada do Sistema',
      excerpt: 'Sistema ficará indisponível no sábado das 2h às 6h...',
      priority: 'medium',
      timestamp: '5 horas atrás',
      read: true
    },
    {
      id: '3',
      title: 'Resultados Q4 2023',
      excerpt: 'Confira os resultados do último trimestre e metas para 2024...',
      priority: 'medium',
      timestamp: '1 dia atrás',
      read: true
    }
  ];


  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header Acolhedor com Gradiente */}
      <div className="bg-gradient-hero text-white p-8 rounded-b-3xl shadow-large mb-6 mx-6 mt-4 animate-scale-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Bom dia, Drystore! ☀️</h1>
              <p className="text-white/90 text-lg">
                Aqui está o resumo da sua {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })} produtiva
              </p>
            </div>
          </div>
          <div className="text-white/80 text-sm">
            {new Date().toLocaleDateString('pt-BR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
      
      <div className="space-y-6 px-6 pb-6">

        {/* Métricas com KPI Cards Modernos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin ? (
            <>
              <div className="bg-gradient-to-br from-drystore-orange/85 to-drystore-orange/70 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white/95 text-sm font-semibold bg-white/10 px-2 py-1 rounded backdrop-blur-sm">+12%</span>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{(metrics as any).totalUsers || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Usuários Totais</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/80 to-drystore-orange/65 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white/95 text-sm font-semibold bg-white/10 px-2 py-1 rounded backdrop-blur-sm">+8%</span>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{(metrics as any).totalMessages || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Mensagens Totais</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/75 to-drystore-orange/60 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white/95 text-sm font-semibold bg-white/10 px-2 py-1 rounded backdrop-blur-sm">Esta semana</span>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{(metrics as any).documentsCreated || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Documentos Criados</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/90 to-drystore-orange/75 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white/95 text-sm font-semibold bg-white/10 px-2 py-1 rounded backdrop-blur-sm">+5%</span>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{(metrics as any).engagementRate || 0}%</div>
                  <div className="text-white/90 text-sm font-medium">Taxa de Engajamento</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-drystore-orange/85 to-drystore-orange/70 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  {metrics.unreadAnnouncements > 0 && (
                    <span className="text-white/95 text-sm font-semibold bg-red-500/80 px-2 py-1 rounded backdrop-blur-sm">Novo!</span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{metrics.unreadAnnouncements}</div>
                  <div className="text-white/90 text-sm font-medium">Comunicados Não Lidos</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/80 to-drystore-orange/65 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  {metrics.unreadDocuments > 0 && (
                    <span className="text-white/95 text-sm font-semibold bg-yellow-500/80 px-2 py-1 rounded backdrop-blur-sm">Pendente</span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{metrics.unreadDocuments}</div>
                  <div className="text-white/90 text-sm font-medium">Documentos Pendentes</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/75 to-drystore-orange/60 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  {metrics.pendingTasks > 0 && (
                    <span className="text-white/95 text-sm font-semibold bg-orange-500/80 px-2 py-1 rounded backdrop-blur-sm">Ação</span>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{metrics.pendingTasks}</div>
                  <div className="text-white/90 text-sm font-medium">Tarefas Pendentes</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-drystore-orange/90 to-drystore-orange/75 p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up border border-drystore-orange/20" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/15 rounded-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white/95 text-sm font-semibold bg-green-500/80 px-2 py-1 rounded backdrop-blur-sm">Hoje</span>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1 text-white">{metrics.activityToday}</div>
                  <div className="text-white/90 text-sm font-medium">Atividade Hoje</div>
                </div>
              </div>
            </>
          )}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comunicados Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Comunicados Recentes
                </CardTitle>
                <CardDescription>
                  Mantenha-se atualizado com as novidades da empresa
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                  !announcement.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      {!announcement.read && (
                        <Badge variant="default">Novo</Badge>
                      )}
                      <Badge 
                        variant={announcement.priority === 'high' ? 'destructive' : 'outline'}
                      >
                        {announcement.priority === 'high' ? 'Urgente' : 'Normal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {announcement.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {announcement.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tarefas Pendentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Tarefas Pendentes
                </CardTitle>
                <CardDescription>
                  {pendingTasks.length} tarefas pendentes
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {pendingTasks.length} pendente{pendingTasks.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Todas as tarefas concluídas!</p>
                <p className="text-xs mt-1">Você está em dia com suas pendências 🎉</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    if (task.type === 'announcement') {
                      window.location.href = '/announcements';
                    } else if (task.type === 'document') {
                      window.location.href = `/documents/${task.resource_id}`;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-2 h-2 rounded-full mt-2 ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'important' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {task.title}
                        </h4>
                        <Badge 
                          variant={task.priority === 'urgent' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {task.priority === 'urgent' ? 'Urgente' : 
                           task.priority === 'important' ? 'Importante' : 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {task.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {task.type === 'announcement' ? '📢' : '📄'} {task.type === 'announcement' ? 'Comunicado' : 'Documento'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
            {pendingTasks.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm">
                  Ver mais {pendingTasks.length - 5} tarefas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentions Section */}
        <MentionsList limit={5} compact={true} />
      </div>
      </div>
    </div>
  );
}