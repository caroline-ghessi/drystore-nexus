-- 1) Helper para evitar recursão em políticas de canal
CREATE OR REPLACE FUNCTION public.is_member_of_channel(channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members cm
    WHERE cm.channel_id = is_member_of_channel.channel_id
      AND cm.user_id = auth.uid()
  );
$$;

-- 2) Corrigir política recursiva em channel_members
DROP POLICY IF EXISTS "Channel members can view channel membership" ON public.channel_members;
CREATE POLICY "Channel members can view channel membership"
  ON public.channel_members
  FOR SELECT
  TO public
  USING (public.is_member_of_channel(channel_members.channel_id));

-- 3) Atualizar política de SELECT em channels para usar a função
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON public.channels;
CREATE POLICY "Public channels are viewable by everyone"
  ON public.channels
  FOR SELECT
  TO public
  USING ((NOT is_private) OR public.is_member_of_channel(id));

-- 4) Atualizar políticas em messages para usar a função e reduzir dependência direta
DROP POLICY IF EXISTS "Users can send messages to their channels" ON public.messages;
CREATE POLICY "Users can send messages to their channels"
  ON public.messages
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_member_of_channel(channel_id)
  );

DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.messages;
CREATE POLICY "Users can view messages in their channels"
  ON public.messages
  FOR SELECT
  TO public
  USING (public.is_member_of_channel(channel_id));

-- 5) Reforçar política de INSERT em documents para garantir autoria
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
CREATE POLICY "Users can create their own documents"
  ON public.documents
  FOR INSERT
  TO public
  WITH CHECK (created_by = auth.uid());

-- Observação: triggers já existentes (set_documents_defaults, set_documents_last_modified, update_updated_at_column)
-- continuam válidos e garantem consistência em updates.