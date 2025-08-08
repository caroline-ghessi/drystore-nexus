-- Add reply_to_id and mentions columns to messages table
ALTER TABLE public.messages 
ADD COLUMN reply_to_id UUID REFERENCES public.messages(id),
ADD COLUMN mentions JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance on reply queries
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id);

-- Create index for mentions queries
CREATE INDEX idx_messages_mentions ON public.messages USING GIN(mentions);

-- Function to get channel members for mentions
CREATE OR REPLACE FUNCTION public.get_channel_members(channel_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  INNER JOIN public.channel_members cm ON p.user_id = cm.user_id
  WHERE cm.channel_id = get_channel_members.channel_id;
$$;