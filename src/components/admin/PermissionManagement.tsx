import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Users, UserCheck } from 'lucide-react';

interface UserWithPermissions {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  job_position?: {
    name: string;
    department: string;
  };
}

export function PermissionManagement() {
  // Fetch users with permissions
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          job_position:job_positions(name, department)
        `)
        .order('display_name');
      
      if (error) throw error;
      return data as UserWithPermissions[];
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

  const adminUsers = users.filter(user => 
    userRoles.some(role => role.user_id === user.user_id && role.permission === 'admin')
  );
  
  const regularUsers = users.filter(user => 
    !userRoles.some(role => role.user_id === user.user_id && role.permission === 'admin')
  );

  if (isLoading) {
    return <div>Carregando permissões...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {((adminUsers.length / users.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Padrão</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {((regularUsers.length / users.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Administrators Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Administradores</h3>
          <Badge variant="default">{adminUsers.length}</Badge>
        </div>
        
        {adminUsers.length > 0 ? (
          <div className="grid gap-3">
            {adminUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{user.display_name || 'Usuário sem nome'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.job_position?.name || 'Sem cargo'} • {user.job_position?.department || 'Sem departamento'}
                    </p>
                  </div>
                  
                  <Badge variant="default">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum administrador encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Regular Users Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Usuários Padrão</h3>
          <Badge variant="secondary">{regularUsers.length}</Badge>
        </div>
        
        {regularUsers.length > 0 ? (
          <div className="grid gap-3">
            {regularUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{user.display_name || 'Usuário sem nome'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.job_position?.name || 'Sem cargo'} • {user.job_position?.department || 'Sem departamento'}
                    </p>
                  </div>
                  
                  <Badge variant="secondary">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Usuário
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum usuário padrão encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Sobre as Permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Administradores:</strong> Possuem acesso total ao sistema, incluindo gerenciamento de usuários, cargos e permissões.</p>
          <p><strong>Usuários Padrão:</strong> Possuem acesso às funcionalidades básicas do sistema como chat, documentos e base de conhecimento.</p>
          <p className="text-xs mt-4">
            💡 Para alterar permissões, use a aba "Usuários" e clique nos botões de promoção/remoção de admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}