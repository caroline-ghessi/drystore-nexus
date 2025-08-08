-- Criar função de debug para verificar se o usuário é membro do canal
CREATE OR REPLACE FUNCTION public.debug_channel_membership(channel_id_param UUID)
RETURNS TABLE (
  current_user_id UUID,
  channel_id UUID,
  is_member BOOLEAN,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    channel_id_param as channel_id,
    EXISTS (
      SELECT 1
      FROM public.channel_members cm
      WHERE cm.channel_id = channel_id_param
        AND cm.user_id = auth.uid()
    ) as is_member,
    (SELECT COUNT(*) FROM public.channel_members cm WHERE cm.channel_id = channel_id_param) as member_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a função is_member_of_channel com logs
CREATE OR REPLACE FUNCTION public.is_member_of_channel(channel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members cm
    WHERE cm.channel_id = is_member_of_channel.channel_id
      AND cm.user_id = current_user_id
  ) INTO result;
  
  -- Log para debug (apenas em desenvolvimento)
  RAISE LOG 'is_member_of_channel - User: %, Channel: %, Result: %', 
    current_user_id, channel_id, result;
    
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;