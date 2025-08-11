import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useReadTracking } from '@/hooks/useReadTracking';
import { useToast } from '@/hooks/use-toast';

interface DocumentReadConfirmationProps {
  documentId: string;
  onConfirmed?: () => void;
}

export function DocumentReadConfirmation({ 
  documentId, 
  onConfirmed 
}: DocumentReadConfirmationProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const { markDocumentRead, getDocumentReadStatus } = useReadTracking();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já foi confirmado
    const checkReadStatus = async () => {
      const status = await getDocumentReadStatus(documentId);
      setIsConfirmed(status.isConfirmed || false);
    };

    checkReadStatus();

    // Detectar se o usuário chegou ao final do documento
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Considera que chegou ao final se está a 100px do final
      if (scrollPosition >= documentHeight - 100) {
        setHasScrolledToEnd(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [documentId, getDocumentReadStatus]);

  const handleConfirmRead = async () => {
    setLoading(true);
    
    try {
      await markDocumentRead(documentId, true);
      setIsConfirmed(true);
      onConfirmed?.();
      
      toast({
        title: "Leitura confirmada",
        description: "Documento marcado como lido e compreendido."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar a leitura.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked && hasScrolledToEnd) {
      handleConfirmRead();
    } else if (checked && !hasScrolledToEnd) {
      toast({
        title: "Leia todo o documento",
        description: "Por favor, leia todo o documento antes de confirmar.",
        variant: "destructive"
      });
    }
  };

  if (isConfirmed) {
    return (
      <Card className="p-6 mt-8 bg-success-50 border-success-200">
        <div className="flex items-center gap-3 text-success-800">
          <CheckCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Documento confirmado como lido</h3>
            <p className="text-sm text-success-700">
              Você confirmou que leu e compreendeu este documento.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mt-8 border-warning-200 bg-warning-50">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-warning-800 mb-2">
            Confirmação de Leitura
          </h3>
          <p className="text-sm text-warning-700">
            Para completar a leitura deste documento, confirme que você leu 
            e compreendeu todo o conteúdo apresentado.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="confirm-read"
            checked={isConfirmed}
            onCheckedChange={handleCheckboxChange}
            disabled={loading || !hasScrolledToEnd}
          />
          <label 
            htmlFor="confirm-read" 
            className="text-sm text-warning-800 cursor-pointer"
          >
            Li e compreendi todo o conteúdo deste documento
          </label>
        </div>

        {!hasScrolledToEnd && (
          <p className="text-xs text-warning-600">
            * Role até o final do documento para confirmar a leitura
          </p>
        )}

        <Button 
          onClick={handleConfirmRead}
          disabled={loading || !hasScrolledToEnd}
          className="w-full"
          variant="default"
        >
          {loading ? 'Confirmando...' : 'Confirmar Leitura'}
        </Button>
      </div>
    </Card>
  );
}