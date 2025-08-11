import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  email: string;
  token: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  expires_at: string;
  created_at: string;
  inviter_name?: string;
}

interface SendInvitationData {
  email: string;
  message?: string;
}

export function useInvitations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invitations
  const { data: invitations = [], isLoading, error } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations' as any)
        .select(`
          *,
          profiles!invitations_invited_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((invitation: any) => ({
        ...invitation,
        inviter_name: invitation.profiles?.display_name || 'Administrador'
      })) as Invitation[];
    },
  });

  // Send invitation
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: SendInvitationData) => {
      const { data: result, error } = await supabase.functions.invoke('send-invitation', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Convite enviado!",
        description: "O convite foi enviado por email com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Resend invitation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error('Convite não encontrado');

      const { data: result, error } = await supabase.functions.invoke('send-invitation', {
        body: { email: invitation.email }
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Convite reenviado!",
        description: "O convite foi reenviado por email com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Cancel invitation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations' as any)
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Validate invitation token (for public use)
  const validateInvitationToken = async (token: string) => {
    const { data, error } = await supabase.rpc('validate_invitation_token' as any, {
      invitation_token: token
    });

    if (error) throw error;
    return data;
  };

  return {
    invitations,
    isLoading,
    error,
    sendInvitation: sendInvitationMutation.mutate,
    isInviting: sendInvitationMutation.isPending,
    resendInvitation: resendInvitationMutation.mutate,
    isResending: resendInvitationMutation.isPending,
    cancelInvitation: cancelInvitationMutation.mutate,
    isCancelling: cancelInvitationMutation.isPending,
    validateInvitationToken,
  };
}