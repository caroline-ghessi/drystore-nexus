import { useNavigate } from "react-router-dom"
import { MessageCircle, FileText, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Index = () => {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: "Canal Geral",
      description: "Conversas da equipe",
      icon: MessageCircle,
      action: () => navigate("/channel/geral"),
      count: "3 novas mensagens"
    },
    {
      title: "Documentos",
      description: "Políticas e manuais",
      icon: FileText,
      action: () => navigate("/documents/codigo-conduta"),
      count: "5 documentos"
    },
    {
      title: "Anúncios",
      description: "Comunicados oficiais",
      icon: TrendingUp,
      action: () => navigate("/channel/anuncios"),
      count: "Últimas novidades"
    },
    {
      title: "Equipe",
      description: "Status da equipe",
      icon: Users,
      action: () => navigate("/channel/geral"),
      count: "8 online"
    }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Portal Drystore
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bem-vindo ao centro de comunicação interna da Drystore. 
            Conecte-se com sua equipe e acesse documentos importantes.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-medium transition-shadow duration-normal"
              onClick={action.action}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
                  <action.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  {action.count}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atualizações e mensagens importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                  J
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">João Silva postou no #geral</p>
                  <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-medium text-sm">
                  RH
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo documento adicionado: Manual do Funcionário v3.0</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maria Santos enviou uma mensagem direta</p>
                  <p className="text-xs text-muted-foreground">Há 1 dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
