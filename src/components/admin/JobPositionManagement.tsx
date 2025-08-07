import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobPosition {
  id: string;
  name: string;
  description: string | null;
  department: string | null;
  profiles?: Array<{ id: string }>;
}

export function JobPositionManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job positions with user count
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['job-positions-with-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select(`
          *,
          profiles(id)
        `)
        .order('department', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as JobPosition[];
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingPosition) {
        const { error } = await supabase
          .from('job_positions')
          .update(data)
          .eq('id', editingPosition.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_positions')
          .insert(data);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-positions-with-count'] });
      queryClient.invalidateQueries({ queryKey: ['job-positions'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingPosition ? 'Cargo atualizado' : 'Cargo criado',
        description: `O cargo foi ${editingPosition ? 'atualizado' : 'criado'} com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cargo.',
        variant: 'destructive',
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-positions-with-count'] });
      queryClient.invalidateQueries({ queryKey: ['job-positions'] });
      toast({
        title: 'Cargo removido',
        description: 'O cargo foi removido com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o cargo.',
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', department: '' });
    setEditingPosition(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (position: JobPosition) => {
    setFormData({
      name: position.name,
      description: position.description || '',
      department: position.department || '',
    });
    setEditingPosition(position);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (position: JobPosition) => {
    if (position.profiles && position.profiles.length > 0) {
      toast({
        title: 'Não é possível remover',
        description: 'Este cargo possui usuários vinculados. Remova-os primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Tem certeza que deseja remover o cargo "${position.name}"?`)) {
      deleteMutation.mutate(position.id);
    }
  };

  // Group positions by department
  const positionsByDepartment = positions.reduce((acc, position) => {
    const dept = position.department || 'Sem departamento';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(position);
    return acc;
  }, {} as Record<string, JobPosition[]>);

  if (isLoading) {
    return <div>Carregando cargos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Cargos da Empresa</h3>
          <p className="text-sm text-muted-foreground">
            {positions.length} cargo(s) cadastrado(s)
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? 'Editar Cargo' : 'Novo Cargo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Cargo</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Senior"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Departamento</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Ex: Tecnologia"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do cargo..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Positions by Department */}
      <div className="space-y-6">
        {Object.entries(positionsByDepartment).map(([department, departmentPositions]) => (
          <div key={department}>
            <h4 className="font-medium text-lg mb-3 border-b pb-2">{department}</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departmentPositions.map((position) => (
                <Card key={position.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{position.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {position.department}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(position)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(position)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {position.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {position.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">
                        {position.profiles?.length || 0} usuário(s)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {positions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cargo cadastrado</p>
            <p className="text-sm">Clique em "Novo Cargo" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}