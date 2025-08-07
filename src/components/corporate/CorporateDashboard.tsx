import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Corporativo</h1>
          <p className="text-muted-foreground">
            Visão geral da sua atividade na Drystore
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}