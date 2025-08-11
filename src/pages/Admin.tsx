import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, Shield, Mail } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { JobPositionManagement } from '@/components/admin/JobPositionManagement';
import { PermissionManagement } from '@/components/admin/PermissionManagement';
import { InvitationManagement } from '@/components/admin/InvitationManagement';

export default function Admin() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, cargos e permissões do sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Cargos
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize e edite informações dos usuários, cargos e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Convites</CardTitle>
              <CardDescription>
                Envie convites por email e gerencie usuários pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Cargos</CardTitle>
              <CardDescription>
                Crie, edite e remova cargos da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobPositionManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Permissões</CardTitle>
              <CardDescription>
                Controle as permissões de acesso dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}