
-- 1) Relaxar a política de INSERT e focar apenas em "usuário autenticado"
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;

CREATE POLICY "Authenticated users can create documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Fortalecer o preenchimento de ownership via trigger
-- Recria a função para garantir owner e last_modified corretos, sem permitir impersonação
CREATE OR REPLACE FUNCTION public.set_documents_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Se houver contexto de usuário autenticado, força o owner correto
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
    NEW.last_modified_by := auth.uid();
  ELSE
    -- sem contexto de auth (ex: service role), mantém valores fornecidos
    IF NEW.last_modified_by IS NULL THEN
      NEW.last_modified_by := NEW.created_by;
    END IF;
  END IF;

  IF NEW.version IS NULL THEN
    NEW.version := 1;
  END IF;
  IF NEW.is_public IS NULL THEN
    NEW.is_public := false;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Trigger BEFORE INSERT para aplicar os defaults/owner
DROP TRIGGER IF EXISTS trg_set_documents_defaults ON public.documents;
CREATE TRIGGER trg_set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

-- 4) Trigger BEFORE UPDATE para manter last_modified_by atualizado
CREATE OR REPLACE FUNCTION public.set_documents_last_modified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.last_modified_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_documents_last_modified ON public.documents;
CREATE TRIGGER trg_set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();
