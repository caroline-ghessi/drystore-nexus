import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MentionsList } from '@/components/mentions/MentionsList';
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
  ArrowRight
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
  const metrics = [
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

  const tasks: TaskItem[] = [
    {
      id: '1',
      title: 'Ler Código de Conduta',
      description: 'Revisar e confirmar leitura do código de conduta atualizado',
      deadline: 'Hoje',
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Completar Treinamento de Segurança',
      description: 'Módulo obrigatório sobre segurança da informação',
      deadline: 'Em 2 dias',
      completed: false,
      priority: 'high'
    },
    {
      id: '3',
      title: 'Avaliação de Performance',
      description: 'Preencher auto-avaliação trimestral',
      deadline: 'Em 5 dias',
      completed: true,
      priority: 'medium'
    }
  ];

  const pendingTasks = tasks.filter(task => !task.completed);
  const completionRate = ((tasks.length - pendingTasks.length) / tasks.length) * 100;

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
          <div className="bg-gradient-card p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-green-300 text-sm font-semibold">+12%</span>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">284</div>
              <div className="text-white/80 text-sm">Colaboradores Ativos</div>
            </div>
          </div>

          <div className="bg-gradient-primary p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-green-300 text-sm font-semibold">+8%</span>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">1,847</div>
              <div className="text-white/80 text-sm">Mensagens Hoje</div>
            </div>
          </div>

          <div className="bg-gradient-secondary p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-blue-300 text-sm font-semibold">5 esta semana</span>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">23</div>
              <div className="text-white/80 text-sm">Documentos Atualizados</div>
            </div>
          </div>

          <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-green-300 text-sm font-semibold">-15%</span>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">2.3h</div>
              <div className="text-white/80 text-sm">Tempo Resposta Médio</div>
            </div>
          </div>
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
                  {pendingTasks.length} de {tasks.length} tarefas pendentes
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
                <p className="text-xs text-muted-foreground">Concluído</p>
              </div>
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-colors ${
                  task.completed 
                    ? 'bg-success/5 border-success/20 opacity-75' 
                    : 'bg-background hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded border-2 mt-0.5 ${
                    task.completed 
                      ? 'bg-success border-success' 
                      : 'border-border'
                  }`}>
                    {task.completed && (
                      <Award className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'outline'}
                      >
                        {task.priority === 'high' ? 'Urgente' : 'Normal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      📅 {task.deadline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mentions Section */}
        <MentionsList limit={5} compact={true} />
      </div>
      </div>
    </div>
  );
}