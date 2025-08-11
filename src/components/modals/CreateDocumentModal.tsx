import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated?: () => void;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
}

export function CreateDocumentModal({ open, onOpenChange, onDocumentCreated }: CreateDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminAccess();

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Verificar se o usuário é admin
      if (!isAdmin) {
        toast({
          title: "Acesso Negado",
          description: "Apenas administradores podem criar documentos.",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }
    }
  }, [open, isAdmin, onOpenChange, toast]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um documento.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem criar documentos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          category: category || null,
          is_public: isPublic,
          content: { type: 'doc', content: [] }, // Empty TipTap document
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o documento.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso!",
      });

      // Reset form
      setTitle('');
      setCategory('');
      setIsPublic(true);
      onOpenChange(false);

      // Call callback to refresh documents list
      if (onDocumentCreated) {
        onDocumentCreated();
      }

      // Navigate to the new document
      if (data?.id) {
        navigate(`/documents/${data.id}`);
      } else {
        navigate('/knowledge-base');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do documento"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Documento público</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}