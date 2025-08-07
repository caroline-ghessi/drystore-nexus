-- Solução 5: Corrigir Sintaxe dos Triggers para a tabela documents
-- Garantir que os triggers sejam criados corretamente sem erros de sintaxe

-- Primeiro, verificar e remover triggers existentes
DROP TRIGGER IF EXISTS trg_set_documents_defaults ON public.documents;
DROP TRIGGER IF EXISTS trg_set_documents_last_modified ON public.documents;

-- Recriar o trigger BEFORE INSERT para definir created_by automaticamente
CREATE TRIGGER trg_set_documents_defaults
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_defaults();

-- Recriar o trigger BEFORE UPDATE para manter last_modified_by atualizado
CREATE TRIGGER trg_set_documents_last_modified
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_documents_last_modified();