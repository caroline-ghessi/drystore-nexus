import { useParams } from "react-router-dom"
import { FileText, Download, Eye, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock documents data
const documentsData: Record<string, {
  name: string
  category: string
  description: string
  content: string
  lastModified: Date
  author: string
  version: string
  tags: string[]
}> = {
  "codigo-conduta": {
    name: "Código de Conduta",
    category: "Políticas",
    description: "Diretrizes de comportamento e ética para todos os colaboradores da Drystore",
    content: `# Código de Conduta - Drystore

## 1. Princípios Fundamentais

A Drystore está comprometida em manter um ambiente de trabalho respeitoso, inclusivo e profissional. Este código estabelece as expectativas de comportamento para todos os colaboradores.

## 2. Respeito e Dignidade

- Tratamos todos os colegas com respeito, independentemente de cargo, departamento ou função
- Não toleramos qualquer forma de discriminação, assédio ou bullying
- Valorizamos a diversidade e promovemos a inclusão

## 3. Integridade Profissional

- Agimos com honestidade em todas as nossas interações
- Mantemos a confidencialidade das informações da empresa
- Evitamos conflitos de interesse

## 4. Comunicação Eficaz

- Comunicamos de forma clara, respeitosa e construtiva
- Escutamos ativamente as opiniões dos outros
- Fornecemos feedback de maneira profissional

## 5. Responsabilidade

- Cumprimos nossos compromissos e prazos
- Assumimos responsabilidade por nossos erros
- Buscamos sempre a melhoria contínua

## 6. Violações

Violações deste código devem ser reportadas ao RH e serão investigadas apropriadamente.`,
    lastModified: new Date("2024-01-15"),
    author: "Recursos Humanos",
    version: "v2.1",
    tags: ["políticas", "conduta", "ética", "rh"]
  },
  "manual-funcionario": {
    name: "Manual do Funcionário",
    category: "RH",
    description: "Guia completo com informações essenciais para novos e atuais funcionários",
    content: `# Manual do Funcionário - Drystore

## Bem-vindo à Drystore!

Este manual contém informações importantes sobre nossa empresa, políticas e procedimentos.

## 1. História da Empresa

A Drystore foi fundada com o objetivo de revolucionar o armazenamento de dados...

## 2. Estrutura Organizacional

- Diretoria Executiva
- Departamento de Tecnologia
- Departamento Comercial
- Recursos Humanos
- Marketing

## 3. Benefícios

- Plano de saúde
- Vale refeição
- Vale transporte
- Auxílio home office
- Participação nos lucros

## 4. Horários e Flexibilidade

- Horário flexível entre 8h e 18h
- Política de home office
- Banco de horas

## 5. Desenvolvimento Profissional

- Programa de treinamentos
- Certificações técnicas
- Mentoria interna`,
    lastModified: new Date("2024-02-20"),
    author: "Recursos Humanos",
    version: "v3.0",
    tags: ["manual", "funcionários", "benefícios", "políticas"]
  },
  "processos-ti": {
    name: "Processos de TI",
    category: "Técnico",
    description: "Documentação técnica e procedimentos para a equipe de TI",
    content: `# Processos de TI - Drystore

## 1. Desenvolvimento de Software

### Metodologia
- Utilizamos metodologia ágil (Scrum)
- Sprints de 2 semanas
- Daily standups às 9h

### Controle de Versão
- Git/GitHub para todos os projetos
- Branches por feature
- Code review obrigatório

### Deploy
- Ambiente de desenvolvimento
- Ambiente de homologação
- Ambiente de produção

## 2. Segurança

### Políticas de Senha
- Mínimo 12 caracteres
- Caracteres especiais obrigatórios
- Renovação a cada 90 dias

### Backup
- Backup diário automático
- Testes de recuperação mensais
- Armazenamento em nuvem e local

## 3. Suporte Técnico

### Níveis de Prioridade
- Crítico: 2 horas
- Alto: 4 horas
- Médio: 24 horas
- Baixo: 72 horas

### Escalação
1. Suporte Nível 1
2. Suporte Nível 2
3. Arquiteto de Sistemas`,
    lastModified: new Date("2024-03-10"),
    author: "Equipe de TI",
    version: "v1.5",
    tags: ["ti", "processos", "desenvolvimento", "segurança"]
  }
}

export default function Documents() {
  const { documentId } = useParams<{ documentId: string }>()
  
  if (!documentId || !documentsData[documentId]) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Documento não encontrado
          </h2>
          <p className="text-muted-foreground">
            O documento que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  const document = documentsData[documentId]

  return (
    <div className="h-full bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">{document.name}</CardTitle>
                  <Badge variant="secondary">{document.category}</Badge>
                </div>
                <CardDescription className="text-base">
                  {document.description}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Document Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Última modificação</p>
                  <p className="text-sm text-muted-foreground">
                    {document.lastModified.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Autor</p>
                  <p className="text-sm text-muted-foreground">{document.author}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Versão</p>
                  <p className="text-sm text-muted-foreground">{document.version}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo do Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                {document.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}