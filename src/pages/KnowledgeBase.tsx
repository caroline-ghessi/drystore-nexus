import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Eye, Calendar, Tag, Settings, Shield, GraduationCap, HelpCircle, Code, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreateDocumentModal } from '@/components/modals/CreateDocumentModal';
import { formatDate } from '@/lib/utils';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Document {
  id: string;
  title: string;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  created_by: string;
  is_public: boolean;
  edited_at?: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
}

interface Category {
  name: string;
  count: number;
  color: string;
  icon: string;
}

const iconMap = {
  Shield,
  Settings,
  GraduationCap,
  HelpCircle,
  Code,
  Users,
  FileText,
};

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
    fetchDocumentCategories();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory, documentCategories]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchDocumentCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching document categories:', error);
        return;
      }

      setDocumentCategories(data || []);
    } catch (error) {
      console.error('Error fetching document categories:', error);
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

    // Generate category counts
    const categoryMap = new Map<string, number>();
    filtered.forEach(doc => {
      if (doc.category) {
        categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
      }
    });

    const categoryList: Category[] = documentCategories
      .map(category => ({
        name: category.name,
        count: categoryMap.get(category.name) || 0,
        color: category.color,
        icon: category.icon
      }))
      .filter(category => category.count > 0 || selectedCategory === 'all');

    setCategories(categoryList);
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get popular documents (mock for now)
  const popularDocuments = filteredDocuments.slice(0, 4).map((doc, index) => ({
    ...doc,
    views: Math.floor(Math.random() * 1000) + 100
  }));

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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Gerenciar Categorias
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Gerenciamento de Categorias</DialogTitle>
                    </DialogHeader>
                    <CategoryManagement />
                  </DialogContent>
                </Dialog>
                
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </div>
            )}
            
            {!isAdmin && (
              <div className="text-sm text-muted-foreground">
                Somente leitura - Apenas administradores podem criar documentos
              </div>
            )}
          </div>

          {/* Categories Grid */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Explorar por Categoria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card 
                    key={category.name} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <CardContent className="p-6">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {getCategoryIcon(category.icon)}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.count} documento(s)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Documents */}
          {popularDocuments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Documentos Mais Acessados</h2>
              <Card>
                <CardContent className="p-0">
                  {popularDocuments.map((doc, index) => (
                    <div 
                      key={doc.id}
                      className="flex items-center p-4 hover:bg-muted/50 border-b last:border-0 cursor-pointer"
                      onClick={() => navigate(`/documents/${doc.id}`)}
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
                          <span>Criado em {formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                      {doc.category && <Badge variant="secondary">{doc.category}</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

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
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Criado em {formatDate(doc.created_at)}
                            {doc.edited_at && doc.edited_at !== doc.created_at && (
                              <span className="ml-2 text-orange-600">
                                • Editado em {formatDate(doc.edited_at)}
                              </span>
                            )}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents/${doc.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
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

      {isAdmin && (
        <CreateDocumentModal 
          open={isCreateModalOpen} 
          onOpenChange={setIsCreateModalOpen} 
          onDocumentCreated={() => {
            fetchDocuments();
            fetchDocumentCategories();
          }}
        />
      )}
    </div>
  );
}