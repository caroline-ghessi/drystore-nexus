import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDocumentModal({ open, onOpenChange }: CreateDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    isPublic: false
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          title: formData.title,
          category: formData.category || null,
          content: { type: 'doc', content: [] }, // Empty TipTap document
          is_public: formData.isPublic,
          created_by: user.id,
          last_modified_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Documento criado!",
        description: `O documento "${formData.title}" foi criado com sucesso.`,
      });

      setFormData({ title: '', category: '', isPublic: false });
      onOpenChange(false);
      navigate(`/documents/${document.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao criar documento",
        description: error.message,
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
          <DialogTitle>Criar Novo Documento</DialogTitle>
          <DialogDescription>
            Crie um documento com editor de texto rico.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Plano de Negócios"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Planejamento"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
              <Label htmlFor="public">Documento público</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Documento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}