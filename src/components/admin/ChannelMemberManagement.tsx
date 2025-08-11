import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Users, UserMinus, UserPlus, Search, Download } from 'lucide-react';

interface ChannelMemberManagementProps {
  channelId: string;
  channelName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
}

export function ChannelMemberManagement({ channelId, channelName, open, onOpenChange }: ChannelMemberManagementProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();

  useEffect(() => {
    if (open && isAdmin) {
      fetchMembers();
      fetchAllProfiles();
    }
  }, [open, isAdmin, channelId]);

  const fetchMembers = async () => {
    try {
      // First get channel members
      const { data: memberData, error: memberError } = await supabase
        .from('channel_members')
        .select('user_id, role, joined_at')
        .eq('channel_id', channelId);

      if (memberError) throw memberError;

      if (memberData) {
        // Get profile data for each member
        const userIds = memberData.map(m => m.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        if (profileError) throw profileError;

        // Combine the data
        const membersWithProfiles = memberData.map(member => {
          const profile = profileData?.find(p => p.user_id === member.user_id);
          return {
            ...member,
            profiles: {
              display_name: profile?.display_name || 'Usuário',
              avatar_url: profile?.avatar_url
            }
          };
        });

        setMembers(membersWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url');

      if (error) throw error;
      setAllProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const removeMember = async (userId: string) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.user_id !== userId));
      toast({
        title: "Membro removido",
        description: "O membro foi removido do canal com sucesso.",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (userId: string) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      await fetchMembers(); // Refresh members list
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado ao canal com sucesso.",
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportConversation = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('export-conversations', {
        body: {
          channelId,
          format: 'json'
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canal-${channelName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "A conversa foi exportada com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a conversa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  const memberIds = members.map(m => m.user_id);
  const nonMembers = allProfiles.filter(p => !memberIds.includes(p.user_id));
  
  const filteredMembers = members.filter(m => 
    m.profiles.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredNonMembers = nonMembers.filter(p => 
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Membros - #{channelName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportConversation} variant="outline" disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Current Members */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membros ({filteredMembers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {filteredMembers.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.profiles.avatar_url} />
                      <AvatarFallback>
                        {member.profiles.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.profiles.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Entrou em {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {member.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMember(member.user_id)}
                        disabled={loading}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Users */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Adicionar Membros ({filteredNonMembers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {filteredNonMembers.map((profile) => (
                <div key={profile.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {(profile.display_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{profile.display_name || 'Usuário'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMember(profile.user_id)}
                    disabled={loading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}