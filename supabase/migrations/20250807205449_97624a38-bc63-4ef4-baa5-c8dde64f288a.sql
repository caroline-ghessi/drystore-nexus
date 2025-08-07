-- Solução 2: Modificar Política RLS para permitir created_by NULL temporariamente
-- Isso permite que o trigger BEFORE INSERT preencha o campo após a verificação RLS

DROP POLICY "Users can create their own documents" ON public.documents;

CREATE POLICY "Users can create their own documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() OR 
    (created_by IS NULL AND auth.uid() IS NOT NULL)
  );