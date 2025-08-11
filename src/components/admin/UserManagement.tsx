import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserCheck, UserX, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_position_id: string | null;
  job_position?: {
    name: string;
    department: string;
  };
}

interface JobPosition {
  id: string;
  name: string;
  department: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    display_name: string;
    job_position_id: string;
  }>({ display_name: '', job_position_id: '' });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          bio,
          job_position_id,
          job_position:job_positions(name, department)
        `);
      
      if (error) throw error;
      return data as User[];
    }
  });

  // Fetch user roles separately
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, permission');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch job positions
  const { data: jobPositions = [] } = useQuery({
    queryKey: ['job-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as JobPosition[];
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
      toast({
        title: 'Usuário atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  });

  // Toggle admin permission mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remove admin permission
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('permission', 'admin');
        
        if (error) throw error;
      } else {
        // Add admin permission
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, permission: 'admin' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Permissão atualizada',
        description: 'As permissões do usuário foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar permissão',
        description: 'Não foi possível alterar as permissões.',
        variant: 'destructive',
      });
    }
  });

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_position?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_position?.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (user: User) => {
    setEditingUser(user.user_id);
    setEditForm({
      display_name: user.display_name || '',
      job_position_id: user.job_position_id || '',
    });
  };

  const saveChanges = () => {
    if (!editingUser) return;
    
    updateUserMutation.mutate({
      userId: editingUser,
      updates: editForm
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ display_name: '', job_position_id: '' });
  };

  const isUserAdmin = (user: User) => {
    return userRoles.some(role => role.user_id === user.user_id && role.permission === 'admin');
  };

  if (isLoading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.display_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              {editingUser === user.user_id ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Nome do usuário"
                  />
                  <Select
                    value={editForm.job_position_id}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, job_position_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobPositions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name} - {position.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium">{user.display_name || 'Usuário sem nome'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.job_position?.name || 'Sem cargo'} • {user.job_position?.department || 'Sem departamento'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isUserAdmin(user) ? "default" : "secondary"}>
                {isUserAdmin(user) ? 'Admin' : 'Usuário'}
              </Badge>

              {editingUser === user.user_id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveChanges} disabled={updateUserMutation.isPending}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEditing(user)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isUserAdmin(user) ? "destructive" : "default"}
                    onClick={() => toggleAdminMutation.mutate({ 
                      userId: user.user_id, 
                      isAdmin: isUserAdmin(user) 
                    })}
                    disabled={toggleAdminMutation.isPending}
                  >
                    {isUserAdmin(user) ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    </div>
  );
}