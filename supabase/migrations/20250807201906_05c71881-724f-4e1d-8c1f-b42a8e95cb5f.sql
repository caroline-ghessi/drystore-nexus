-- Attach triggers to documents to automatically set ownership and timestamps
-- Safe re-creation
DROP TRIGGER IF EXISTS set_documents_defaults_before_insert ON public.documents;
DROP TRIGGER IF EXISTS set_documents_last_modified_before_update ON public.documents;
DROP TRIGGER IF EXISTS update_documents_updated_at_before_update ON public.documents;

-- BEFORE INSERT: set created_by, last_modified_by, version, is_public when missing
CREATE TRIGGER set_documents_defaults_before_insert
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

-- BEFORE UPDATE: ensure last_modified_by is current user
CREATE TRIGGER set_documents_last_modified_before_update
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();

-- BEFORE UPDATE: bump updated_at timestamp
CREATE TRIGGER update_documents_updated_at_before_update
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();