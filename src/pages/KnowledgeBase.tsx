import { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, Plus, Star, Clock, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CreateDocumentModal } from '@/components/modals/CreateDocumentModal';

interface Document {
  id: string;
  title: string;
  category: string;
  tags: string[];
  created_at: string;
  created_by: string;
  is_public: boolean;
}

interface Category {
  name: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      
      // Generate categories from documents
      const categoryMap = new Map();
      data?.forEach(doc => {
        if (doc.category) {
          categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
        }
      });

      const categoriesData: Category[] = [
        { name: 'Políticas Corporativas', count: categoryMap.get('Políticas') || 0, color: 'primary', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Processos e Procedimentos', count: categoryMap.get('Processos') || 0, color: 'success', icon: <Users className="w-4 h-4" /> },
        { name: 'Treinamentos', count: categoryMap.get('Treinamentos') || 0, color: 'warning', icon: <Star className="w-4 h-4" /> },
        { name: 'Documentação Técnica', count: categoryMap.get('Técnica') || 0, color: 'info', icon: <Tag className="w-4 h-4" /> },
      ];

      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const popularDocuments = [
    { title: 'Código de Conduta e Ética', category: 'Políticas', views: 1234 },
    { title: 'Manual do Colaborador', category: 'RH', views: 987 },
    { title: 'Política de Segurança da Informação', category: 'TI', views: 654 },
    { title: 'Procedimentos de Vendas', category: 'Comercial', views: 432 },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Central de Conhecimento</h1>
          <p className="text-primary-foreground/80 mb-8">
            Encontre rapidamente informações, políticas e procedimentos da Drystore
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              className="pl-12 pr-16 py-4 text-lg bg-background text-foreground"
              placeholder="Buscar artigos, políticas, tutoriais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                Ctrl+K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Políticas">Políticas Corporativas</SelectItem>
                  <SelectItem value="Processos">Processos e Procedimentos</SelectItem>
                  <SelectItem value="Treinamentos">Treinamentos</SelectItem>
                  <SelectItem value="Técnica">Documentação Técnica</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Mais Filtros
              </Button>
            </div>
            
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Explorar por Categoria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.name} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCategory(category.name.split(' ')[0])}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-${category.color}/10 flex items-center justify-center mb-4`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category.count} documentos
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Documents */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Documentos Mais Acessados</h2>
            <Card>
              <CardContent className="p-0">
                {popularDocuments.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-4 hover:bg-muted/50 border-b last:border-0 cursor-pointer"
                    onClick={() => navigate('/documents/1')}
                  >
                    <span className="text-2xl font-bold text-muted-foreground mr-4 w-8">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{doc.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.views} visualizações</span>
                        <span>•</span>
                        <span>Atualizado hoje</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{doc.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'all' ? 'Todos os Documentos' : `Categoria: ${selectedCategory}`}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredDocuments.length} documento(s) encontrado(s)
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card 
                  key={doc.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {doc.category && (
                        <Badge variant="secondary">{doc.category}</Badge>
                      )}
                      {doc.is_public && (
                        <Badge variant="outline">Público</Badge>
                      )}
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateDocumentModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
}