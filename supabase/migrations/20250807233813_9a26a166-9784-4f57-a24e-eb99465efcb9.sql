-- Solução 6: Correção DEFINITIVA da sintaxe dos triggers
-- SQL completamente limpo sem erros de sintaxe

-- Remove triggers existentes se houver
DROP TRIGGER IF EXISTS trg_set_documents_defaults ON public.documents;
DROP TRIGGER IF EXISTS trg_set_documents_last_modified ON public.documents;

-- Cria trigger BEFORE INSERT (sintaxe correta)
CREATE TRIGGER trg_set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

-- Cria trigger BEFORE UPDATE (sintaxe correta - SEM ponto e vírgula duplo)
CREATE TRIGGER trg_set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();