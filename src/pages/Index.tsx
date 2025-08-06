import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, MessageCircle, FileText, Activity, TrendingUp } from "lucide-react"

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Home className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Home</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta ao Portal Interno da Drystore
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Welcome Section */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">
                Olá, {user?.user_metadata?.display_name || user?.email}! 👋
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Aqui está um resumo da sua atividade hoje
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Mensagens não lidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Canais ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <Activity className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Tarefas pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova mensagem em #geral</p>
                    <p className="text-xs text-muted-foreground">há 5 minutos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documento "Relatório Q4" atualizado</p>
                    <p className="text-xs text-muted-foreground">há 1 hora</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">João Silva entrou no canal #projetos</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Canais em Alta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm font-medium">#geral</span>
                  </div>
                  <span className="text-xs text-muted-foreground">24 mensagens</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-success rounded-full" />
                    <span className="text-sm font-medium">#projetos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">18 mensagens</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    <span className="text-sm font-medium">#random</span>
                  </div>
                  <span className="text-xs text-muted-foreground">12 mensagens</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse as principais funcionalidades do portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/channel/geral')}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-sm">Nova Mensagem</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/channel/geral')}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Criar Canal</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/documents')}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Novo Documento</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/activity')}
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Ver Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}