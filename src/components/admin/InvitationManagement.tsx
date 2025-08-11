import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  Copy, 
  RefreshCw, 
  X, 
  Calendar,
  User,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Mail },
  accepted: { label: 'Aceito', color: 'bg-green-100 text-green-800', icon: User },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-800', icon: Calendar },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: X },
};

export function InvitationManagement() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
  const {
    invitations,
    isLoading,
    sendInvitation,
    isInviting,
    resendInvitation,
    isResending,
    cancelInvitation,
    isCancelling,
  } = useInvitations();

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    sendInvitation(
      { email: email.trim(), message: message.trim() || undefined },
      {
        onSuccess: () => {
          setEmail('');
          setMessage('');
        },
      }
    );
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado!",
      description: "O link do convite foi copiado para a área de transferência.",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusDisplay = (status: string, expiresAt: string) => {
    if (status === 'sent' && isExpired(expiresAt)) {
      return statusConfig.expired;
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Convite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Novo Convite
          </CardTitle>
          <CardDescription>
            Convide novos usuários para o sistema via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Convidado *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem personalizada ao convite..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button type="submit" disabled={isInviting || !email.trim()}>
              {isInviting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Enviados
          </CardTitle>
          <CardDescription>
            Gerencie todos os convites enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum convite enviado ainda</p>
              <p className="text-sm">Envie o primeiro convite usando o formulário acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const statusDisplay = getStatusDisplay(invitation.status, invitation.expires_at);
                const StatusIcon = statusDisplay.icon;
                const canResend = invitation.status === 'sent' && !isExpired(invitation.expires_at);
                const canCancel = ['pending', 'sent'].includes(invitation.status) && !isExpired(invitation.expires_at);

                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invitation.email}</span>
                        </div>
                        <Badge className={statusDisplay.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusDisplay.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Enviado por: {invitation.inviter_name}</span>
                        <span>•</span>
                        <span>
                          {formatDate(invitation.created_at)} às {formatTime(invitation.created_at)}
                        </span>
                        <span>•</span>
                        <span>
                          Expira em: {formatDate(invitation.expires_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Copiar Link */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInviteLink(invitation.token)}
                        title="Copiar link do convite"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* Reenviar */}
                      {canResend && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendInvitation(invitation.id)}
                          disabled={isResending}
                          title="Reenviar convite"
                        >
                          <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                        </Button>
                      )}

                      {/* Cancelar */}
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          disabled={isCancelling}
                          title="Cancelar convite"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Link Externo */}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Abrir link do convite"
                      >
                        <a
                          href={`/invite/${invitation.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}