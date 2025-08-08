import { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  displayName?: string;
  onAvatarUpdate: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  displayName, 
  onAvatarUpdate,
  className 
}: AvatarUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem PNG, JPG, JPEG ou WebP.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const size = 400; // Redimensionar para 400x400
        canvas.width = size;
        canvas.height = size;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // Qualidade 80%
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!user || !validateFile(file)) return;

    setIsUploading(true);
    
    try {
      // Comprimir imagem
      const compressedFile = await compressImage(file);
      
      // Criar preview
      const preview = URL.createObjectURL(compressedFile);
      setPreviewUrl(preview);

      // Nome do arquivo único por usuário
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true // Substitui arquivo existente
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Adicionar timestamp para evitar cache
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      
      onAvatarUpdate(avatarUrl);
      setPreviewUrl(null);

      toast({
        title: "Avatar atualizado!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      // Remover arquivo do storage
      const filePath = `${user.id}/`;
      await supabase.storage
        .from('avatars')
        .remove([filePath]);

      onAvatarUpdate('');
      
      toast({
        title: "Avatar removido",
        description: "Sua foto de perfil foi removida.",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o avatar.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatarUrl} alt="Avatar" />
          <AvatarFallback className="text-lg font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Enviando...' : 'Alterar foto'}
          </Button>
          
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Remover
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          PNG, JPG, JPEG ou WebP. Máximo 5MB.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}