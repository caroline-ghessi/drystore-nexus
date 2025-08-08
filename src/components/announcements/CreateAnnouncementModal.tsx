
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Image as ImageIcon, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface CreateAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function CreateAnnouncementModal({ open, onOpenChange, onCreated }: CreateAnnouncementModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<'urgent' | 'important' | 'normal' | 'info'>('normal');
  const [content, setContent] = useState<string>(JSON.stringify({ type: 'doc', content: [] }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const canSave = useMemo(() => {
    return !!title.trim();
  }, [title]);

  const handleUploadImage = async (file: File) => {
    if (!user) {
      toast({ title: 'Faça login', description: 'É necessário estar autenticado.', variant: 'destructive' as any });
      return;
    }
    if (!isAdmin) {
      toast({ title: 'Acesso negado', description: 'Apenas administradores podem enviar imagens.', variant: 'destructive' as any });
      return;
    }
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const path = `user-${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('announcements').upload(path, file, {
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('announcements').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Copia a URL para a área de transferência e orienta o usuário a inseri-la via botão de imagem do editor
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: 'Imagem enviada',
        description: 'URL copiada. Clique no botão de imagem do editor e cole a URL.',
      });
    } catch (err: any) {
      console.error('[Announcements] Upload image error:', err);
      toast({ title: 'Falha no upload', description: err?.message || 'Tente novamente.', variant: 'destructive' as any });
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadImage(file);
    e.currentTarget.value = '';
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast({ title: 'Acesso negado', description: 'Apenas administradores podem criar anúncios.', variant: 'destructive' as any });
      return;
    }
    try {
      setSaving(true);
      // content é um JSON string do TipTap (RichTextEditor)
      const parsed = (() => { try { return JSON.parse(content); } catch { return { type: 'doc', content: [] }; } })();

      const { error } = await supabase.from('announcements').insert({
        title: title.trim(),
        content: parsed,
        category: category || null,
        priority,
        is_pinned: false,
        publish_date: new Date().toISOString(),
      } as any);

      if (error) throw error;

      toast({ title: 'Anúncio criado', description: 'Seu comunicado foi publicado com sucesso!' });
      onOpenChange(false);
      setTitle('');
      setCategory('');
      setPriority('normal');
      setContent(JSON.stringify({ type: 'doc', content: [] }));
      onCreated?.();
    } catch (err: any) {
      console.error('[Announcements] Create error:', err);
      toast({ title: 'Erro ao criar', description: err?.message || 'Tente novamente.', variant: 'destructive' as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Novo Anúncio</DialogTitle>
          <DialogDescription>Crie um novo comunicado com texto e imagens.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Atualização de Política" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: RH, TI, Geral..." />
            </div>
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="important">Importante</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Conteúdo</Label>
            <div className="flex items-center gap-2">
              <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('img-upload')?.click()} disabled={uploading}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {uploading ? 'Enviando...' : 'Upload imagem'}
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <RichTextEditor
              content={content}
              onChange={(val) => setContent(val)}
              editable
              placeholder="Digite o conteúdo do anúncio..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
