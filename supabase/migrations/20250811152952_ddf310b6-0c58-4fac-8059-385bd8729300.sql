-- Criar tabela para registrar leituras de comunicados
CREATE TABLE public.announcement_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Criar tabela para registrar leituras de documentos
CREATE TABLE public.document_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed_read boolean NOT NULL DEFAULT false,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Criar tabela para logs de atividade do usuário
CREATE TABLE public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ativar RLS nas novas tabelas
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para announcement_reads
CREATE POLICY "Users can view their own announcement reads" 
ON public.announcement_reads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own announcement reads" 
ON public.announcement_reads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcement reads" 
ON public.announcement_reads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all announcement reads" 
ON public.announcement_reads 
FOR SELECT 
USING (is_current_user_admin());

-- Políticas RLS para document_reads
CREATE POLICY "Users can view their own document reads" 
ON public.document_reads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document reads" 
ON public.document_reads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document reads" 
ON public.document_reads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all document reads" 
ON public.document_reads 
FOR SELECT 
USING (is_current_user_admin());

-- Políticas RLS para user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (is_current_user_admin());

-- Função para registrar atividade
CREATE OR REPLACE FUNCTION public.log_user_activity(
  activity_type text,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, activity_type, resource_type, resource_id, metadata)
  VALUES (auth.uid(), activity_type, resource_type, resource_id, metadata);
END;
$$;

-- Função para marcar comunicado como lido
CREATE OR REPLACE FUNCTION public.mark_announcement_read(announcement_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.announcement_reads (announcement_id, user_id)
  VALUES (announcement_id, auth.uid())
  ON CONFLICT (announcement_id, user_id) 
  DO UPDATE SET read_at = now();
  
  -- Log da atividade
  PERFORM public.log_user_activity('read', 'announcement', announcement_id);
END;
$$;

-- Função para marcar documento como lido
CREATE OR REPLACE FUNCTION public.mark_document_read(document_id uuid, confirmed boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.document_reads (document_id, user_id, confirmed_read, confirmed_at)
  VALUES (document_id, auth.uid(), confirmed, CASE WHEN confirmed THEN now() ELSE NULL END)
  ON CONFLICT (document_id, user_id) 
  DO UPDATE SET 
    read_at = now(),
    confirmed_read = CASE WHEN confirmed THEN true ELSE document_reads.confirmed_read END,
    confirmed_at = CASE WHEN confirmed AND NOT document_reads.confirmed_read THEN now() ELSE document_reads.confirmed_at END,
    updated_at = now();
  
  -- Log da atividade
  PERFORM public.log_user_activity(
    CASE WHEN confirmed THEN 'confirmed_read' ELSE 'read' END, 
    'document', 
    document_id
  );
END;
$$;

-- Função para obter tarefas pendentes do usuário
CREATE OR REPLACE FUNCTION public.get_pending_tasks()
RETURNS TABLE(
  id uuid,
  type text,
  title text,
  description text,
  priority text,
  created_at timestamp with time zone,
  resource_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  -- Comunicados não lidos
  SELECT 
    a.id,
    'announcement'::text as type,
    a.title,
    'Comunicado não lido'::text as description,
    a.priority,
    a.created_at,
    a.id as resource_id
  FROM public.announcements a
  LEFT JOIN public.announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = auth.uid()
  WHERE ar.id IS NULL
  
  UNION ALL
  
  -- Documentos não confirmados como lidos
  SELECT 
    d.id,
    'document'::text as type,
    d.title,
    'Documento não confirmado como lido'::text as description,
    'normal'::text as priority,
    d.created_at,
    d.id as resource_id
  FROM public.documents d
  LEFT JOIN public.document_reads dr ON d.id = dr.document_id AND dr.user_id = auth.uid()
  WHERE d.is_public = true 
    AND (dr.id IS NULL OR dr.confirmed_read = false)
  
  ORDER BY created_at DESC;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_document_reads_updated_at
  BEFORE UPDATE ON public.document_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();