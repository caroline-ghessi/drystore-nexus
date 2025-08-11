-- Criar tabela de categorias predefinidas
CREATE TABLE public.document_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#6366F1',
  icon text DEFAULT 'FileText',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL DEFAULT auth.uid()
);

-- Habilitar RLS na tabela de categorias
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- Adicionar campo edited_at na tabela documents
ALTER TABLE public.documents ADD COLUMN edited_at timestamp with time zone;

-- Atualizar documentos existentes para que edited_at seja igual a updated_at
UPDATE public.documents SET edited_at = updated_at WHERE edited_at IS NULL;

-- Criar políticas RLS para document_categories
CREATE POLICY "Everyone can view categories" 
ON public.document_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create categories" 
ON public.document_categories 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update categories" 
ON public.document_categories 
FOR UPDATE 
USING (is_current_user_admin());

CREATE POLICY "Only admins can delete categories" 
ON public.document_categories 
FOR DELETE 
USING (is_current_user_admin());

-- Remover políticas antigas de documents que permitem usuários normais criarem
DROP POLICY IF EXISTS "Any authenticated user can insert documents" ON public.documents;

-- Criar nova política para permitir apenas admins criarem documentos
CREATE POLICY "Only admins can create documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (is_current_user_admin());

-- Permitir apenas admins deletarem documentos
CREATE POLICY "Only admins can delete documents" 
ON public.documents 
FOR DELETE 
USING (is_current_user_admin());

-- Criar trigger para atualizar edited_at quando documento for editado
CREATE OR REPLACE FUNCTION public.set_document_edited_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Se o conteúdo foi alterado, atualiza edited_at
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.title IS DISTINCT FROM NEW.title OR 
     OLD.category IS DISTINCT FROM NEW.category THEN
    NEW.edited_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_document_edited_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_document_edited_at();

-- Trigger para atualizar updated_at em document_categories
CREATE TRIGGER update_document_categories_updated_at
  BEFORE UPDATE ON public.document_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas categorias padrão
INSERT INTO public.document_categories (name, description, color, icon) VALUES
  ('Políticas', 'Políticas e regulamentos da empresa', '#EF4444', 'Shield'),
  ('Procedimentos', 'Procedimentos operacionais e processos', '#3B82F6', 'Settings'),
  ('Treinamento', 'Materiais de treinamento e capacitação', '#10B981', 'GraduationCap'),
  ('FAQ', 'Perguntas frequentes e respostas', '#F59E0B', 'HelpCircle'),
  ('Técnico', 'Documentação técnica e manuais', '#8B5CF6', 'Code'),
  ('RH', 'Recursos humanos e benefícios', '#EC4899', 'Users');