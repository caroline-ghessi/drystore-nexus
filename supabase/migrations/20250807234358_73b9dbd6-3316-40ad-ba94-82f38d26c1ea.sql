
-- 1) Recriar os triggers dos documentos (definitivo)
DROP TRIGGER IF EXISTS trg_set_documents_defaults ON public.documents;
DROP TRIGGER IF EXISTS trg_set_documents_last_modified ON public.documents;

CREATE TRIGGER trg_set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

CREATE TRIGGER trg_set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();

-- 2) Fortalecer a política de INSERT
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;

-- Mantemos política PERMISSIVA, mas exigimos:
-- - auth.uid() presente
-- - e que created_by seja o próprio usuário ou esteja NULL (para default/trigger preencher)
CREATE POLICY "Authenticated users can create documents"
ON public.documents
FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND coalesce(created_by, auth.uid()) = auth.uid()
);
