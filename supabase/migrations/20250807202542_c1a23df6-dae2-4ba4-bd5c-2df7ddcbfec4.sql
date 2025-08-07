
-- Garantir que RLS está habilitado
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 1) Ajustar a política de INSERT para ser aplicada ao papel 'public'
--    e manter a exigência de usuário autenticado via auth.uid()
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;

CREATE POLICY "Users can create their own documents"
  ON public.documents
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Limpeza de gatilhos duplicados e padronização
-- Remover possíveis gatilhos antigos/duplicados
DROP TRIGGER IF EXISTS set_documents_defaults ON public.documents;
DROP TRIGGER IF EXISTS set_documents_last_modified ON public.documents;
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;

-- Recriar somente o conjunto padronizado de gatilhos
DROP TRIGGER IF EXISTS set_documents_defaults_before_insert ON public.documents;
CREATE TRIGGER set_documents_defaults_before_insert
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

DROP TRIGGER IF EXISTS set_documents_last_modified_before_update ON public.documents;
CREATE TRIGGER set_documents_last_modified_before_update
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();

DROP TRIGGER IF EXISTS update_documents_updated_at_before_update ON public.documents;
CREATE TRIGGER update_documents_updated_at_before_update
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
