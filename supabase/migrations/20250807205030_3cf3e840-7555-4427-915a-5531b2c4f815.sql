-- Solução 1: Definir DEFAULT auth.uid() nas colunas de autoria
-- Isso garante que mesmo sem enviar created_by no payload, o campo será preenchido automaticamente

ALTER TABLE public.documents 
ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE public.documents 
ALTER COLUMN last_modified_by SET DEFAULT auth.uid();