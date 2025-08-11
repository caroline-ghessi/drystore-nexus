-- Atualizar políticas RLS para channels - apenas admins podem criar canais
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
CREATE POLICY "Only admins can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK (is_current_user_admin());

-- Atualizar políticas RLS para channel_members - apenas admins podem gerenciar membros
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;
CREATE POLICY "Only admins can manage channel members" 
ON public.channel_members 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can remove channel members" 
ON public.channel_members 
FOR DELETE 
USING (is_current_user_admin());

-- Garantir que mensagens nunca possam ser deletadas (já existe proteção, mas vamos confirmar)
-- Não há política DELETE para messages, o que já protege contra exclusão

-- Atualizar função handle_new_user para incluir auto-join nos canais públicos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Auto-join em todos os canais públicos
  INSERT INTO public.channel_members (channel_id, user_id, role)
  SELECT c.id, NEW.id, 'member'
  FROM public.channels c
  WHERE c.is_private = false;
  
  RETURN NEW;
END;
$$;