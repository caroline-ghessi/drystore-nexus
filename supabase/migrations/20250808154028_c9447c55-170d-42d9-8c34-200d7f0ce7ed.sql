-- Criar tabela para rastrear status de leitura das menções
CREATE TABLE public.mention_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable Row Level Security
ALTER TABLE public.mention_reads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mention_reads
CREATE POLICY "Users can view their own mention reads" 
ON public.mention_reads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mention reads" 
ON public.mention_reads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mention reads" 
ON public.mention_reads 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_mention_reads_user_id ON public.mention_reads(user_id);
CREATE INDEX idx_mention_reads_message_id ON public.mention_reads(message_id);