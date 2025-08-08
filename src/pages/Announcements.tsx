import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Pin, Calendar, AlertTriangle, Info, CheckCircle2, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { supabase } from '@/integrations/supabase/client';
import CreateAnnouncementModal from '@/components/announcements/CreateAnnouncementModal';
import { extractTextFromTipTapJSON } from '@/utils/extractTextFromTipTap';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'important' | 'normal' | 'info';
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishDate: string;
  isPinned?: boolean;
  readBy: string[];
  reactions: {
    likes: number;
    comments: number;
  };
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Atualização da Política de Trabalho Remoto',
    content: 'A partir de 1º de março, implementaremos uma nova política de trabalho híbrido. Todos os colaboradores poderão trabalhar até 3 dias por semana em casa...',
    priority: 'important',
    category: 'RH',
    author: { name: 'Ana Silva', avatar: '' },
    publishDate: '2024-01-15T10:00:00Z',
    isPinned: true,
    readBy: ['user1', 'user2'],
    reactions: { likes: 24, comments: 5 }
  },
  {
    id: '2',
    title: 'Manutenção do Sistema - Sábado 20/01',
    content: 'Informamos que no sábado, 20 de janeiro, entre 8h e 12h, nossos sistemas estarão em manutenção programada...',
    priority: 'urgent',
    category: 'TI',
    author: { name: 'Carlos Tech', avatar: '' },
    publishDate: '2024-01-12T14:30:00Z',
    readBy: ['user1'],
    reactions: { likes: 8, comments: 2 }
  },
  {
    id: '3',
    title: 'Resultados do 4º Trimestre',
    content: 'Temos o prazer de compartilhar os excelentes resultados alcançados no último trimestre de 2023...',
    priority: 'normal',
    category: 'Geral',
    author: { name: 'João Diretor', avatar: '' },
    publishDate: '2024-01-10T09:15:00Z',
    readBy: ['user1', 'user2', 'user3'],
    reactions: { likes: 45, comments: 12 }
  }
];

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    console.log('[Announcements] Fetching from Supabase...');
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('[Announcements] Error fetching:', error);
      return;
    }

    // Fetch profiles for authors
    const authorIds = Array.from(new Set((data || []).map((d: any) => d.author_user_id).filter(Boolean)));
    let profilesByUserId: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    if (authorIds.length > 0) {
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', authorIds as any);

      if (!profErr && profs) {
        profilesByUserId = profs.reduce((acc: any, p: any) => {
          acc[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
          return acc;
        }, {});
      }
    }

    const mapped: Announcement[] = (data || []).map((row: any) => {
      const author = profilesByUserId[row.author_user_id] || { display_name: null, avatar_url: null };
      const preview = extractTextFromTipTapJSON(row.content).slice(0, 220);
      return {
        id: row.id,
        title: row.title,
        content: preview, // mantém compatibilidade com filtros existentes (string)
        priority: row.priority,
        category: row.category || 'Geral',
        author: { name: author.display_name || 'Anônimo', avatar: author.avatar_url || '' },
        publishDate: row.publish_date,
        isPinned: row.is_pinned,
        readBy: [], // ainda não implementado
        reactions: { likes: 0, comments: 0 }, // placeholder
      } as Announcement;
    });

    setAnnouncements(mapped);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    filterAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements, searchQuery, selectedCategory, selectedPriority]);

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(announcement => announcement.category === selectedCategory);
    }

    if (selectedPriority && selectedPriority !== 'all') {
      filtered = filtered.filter(announcement => announcement.priority === selectedPriority);
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    setFilteredAnnouncements(filtered);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'destructive', icon: AlertTriangle, label: 'Urgente' };
      case 'important':
        return { color: 'warning', icon: Info, label: 'Importante' };
      case 'normal':
        return { color: 'secondary', icon: CheckCircle2, label: 'Normal' };
      case 'info':
        return { color: 'info', icon: Info, label: 'Informativo' };
      default:
        return { color: 'secondary', icon: Info, label: 'Normal' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Megaphone className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Comunicados e Anúncios</h1>
              <p className="text-sm text-muted-foreground">
                Fique por dentro das novidades e comunicações importantes da Drystore
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Anúncio
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              className="pl-10"
              placeholder="Buscar anúncios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="RH">Recursos Humanos</SelectItem>
              <SelectItem value="TI">Tecnologia</SelectItem>
              <SelectItem value="Geral">Geral</SelectItem>
              <SelectItem value="Vendas">Vendas</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="important">Importante</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="info">Informativo</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Mais Filtros
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const priorityConfig = getPriorityConfig(announcement.priority);
            const PriorityIcon = priorityConfig.icon;
            const isRead = true; // placeholder (ainda não implementado)

            return (
              <Card 
                key={announcement.id}
                className={`transition-all hover:shadow-md ${
                  announcement.isPinned ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {announcement.isPinned && (
                        <Pin className="w-4 h-4 text-primary" />
                      )}
                      <Badge variant={priorityConfig.color as any} className="flex items-center gap-1">
                        <PriorityIcon className="w-3 h-3" />
                        {priorityConfig.label}
                      </Badge>
                      <Badge variant="outline">{announcement.category}</Badge>
                      {!isRead && (
                        <Badge variant="secondary" className="text-xs">
                          Não lido
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(announcement.publishDate)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{announcement.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {announcement.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={announcement.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {announcement.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {announcement.author.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{announcement.reactions.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Megaphone className="w-4 h-4" />
                        <span>{announcement.reactions.comments} comentários</span>
                      </button>
                      <Button size="sm" variant="outline">
                        Ler Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredAnnouncements.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum anúncio encontrado</h3>
                <p className="text-muted-foreground">
                  Não encontramos anúncios que correspondam aos filtros selecionados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateAnnouncementModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={fetchAnnouncements}
      />
    </div>
  );
}
