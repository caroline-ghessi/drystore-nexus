-- Ensure documents table sets created_by/last_modified_by from auth.uid() and maintains timestamps

-- Function to set default values on INSERT
CREATE OR REPLACE FUNCTION public.set_documents_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.last_modified_by IS NULL THEN
    NEW.last_modified_by := auth.uid();
  END IF;
  IF NEW.version IS NULL THEN
    NEW.version := 1;
  END IF;
  IF NEW.is_public IS NULL THEN
    NEW.is_public := false;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger before INSERT to set defaults
DROP TRIGGER IF EXISTS set_documents_defaults ON public.documents;
CREATE TRIGGER set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_documents_defaults();

-- Function to set last_modified_by on UPDATE
CREATE OR REPLACE FUNCTION public.set_documents_last_modified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.last_modified_by := auth.uid();
  RETURN NEW;
END;
$$;

-- Trigger before UPDATE to set last_modified_by and updated_at
DROP TRIGGER IF EXISTS set_documents_last_modified ON public.documents;
CREATE TRIGGER set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_documents_last_modified();

-- Ensure updated_at is maintained
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();