import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvitationData {
  email: string;
  invited_by: string;
  inviter_name: string;
  created_at: string;
  expires_at: string;
}

export default function InviteAcceptance() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const { validateInvitationToken } = useInvitations();
  const { toast } = useToast();
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to home
      navigate('/');
      return;
    }

    validateInvitation();
  }, [token, user]);

  const validateInvitation = async () => {
    if (!token) {
      setError('Token de convite inválido');
      setIsValidating(false);
      return;
    }

    try {
      const invitation = await validateInvitationToken(token);
      
      if (!invitation) {
        setError('Convite não encontrado ou expirado');
        setIsValid(false);
      } else {
        setInvitationData(invitation as InvitationData);
        setIsValid(true);
      }
    } catch (err: any) {
      console.error('Error validating invitation:', err);
      setError(err.message || 'Erro ao validar convite');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData || !token) return;
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAccount(true);

    try {
      // Create user account
      const { error: signUpError } = await signUp(
        invitationData.email, 
        password, 
        displayName.trim() || undefined
      );

      if (signUpError) {
        throw signUpError;
      }

      // Accept the invitation
      const { error: acceptError } = await supabase.rpc('accept_invitation' as any, {
        invitation_token: token
      });

      if (acceptError) {
        console.error('Error accepting invitation:', acceptError);
        // Don't throw here, as the account was already created
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta e fazer login.",
      });

      // Redirect to auth page
      navigate('/auth', { 
        state: { 
          message: 'Conta criada! Verifique seu email para confirmar e fazer login.',
          email: invitationData.email 
        } 
      });

    } catch (err: any) {
      console.error('Error creating account:', err);
      toast({
        title: "Erro ao criar conta",
        description: err.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Este convite não é válido ou já expirou.'}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Bem-vindo à DryStore!</CardTitle>
            <CardDescription>
              Complete seu cadastro para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Info */}
          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{invitationData?.email}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Convidado por: {invitationData?.inviter_name}
              </p>
            </div>
          </div>

          <Separator />

          {/* Account Creation Form */}
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Como você gostaria de ser chamado?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isCreatingAccount}
            >
              {isCreatingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/auth')}
              >
                Fazer login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}