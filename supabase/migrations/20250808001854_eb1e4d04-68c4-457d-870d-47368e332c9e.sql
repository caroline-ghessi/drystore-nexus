
-- 1) Recriar triggers dos documentos

DROP TRIGGER IF EXISTS trg_set_documents_defaults ON public.documents;
DROP TRIGGER IF EXISTS trg_set_documents_last_modified ON public.documents;
DROP TRIGGER IF EXISTS trg_documents_update_updated_at ON public.documents;

CREATE TRIGGER trg_set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

CREATE TRIGGER trg_set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();

CREATE TRIGGER trg_documents_update_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Políticas de RLS

-- Simplificar a política de INSERT para qualquer usuário autenticado.
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;

CREATE POLICY "Any authenticated user can insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Garantir que administradores possam ver e editar qualquer documento.
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update any document" ON public.documents;

CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can update any document"
ON public.documents
FOR UPDATE
TO authenticated
USING (public.is_current_user_admin());
