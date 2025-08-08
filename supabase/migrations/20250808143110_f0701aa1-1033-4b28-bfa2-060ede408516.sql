-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message_attachments', 'message_attachments', false);

-- Create RLS policies for message attachments
CREATE POLICY "Users can upload attachments to their messages"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message_attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view attachments in their channels"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'message_attachments'
  AND (
    -- Can access if it's their own message or they're a member of the channel
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id::text = (storage.foldername(name))[1]
      AND (
        m.user_id = auth.uid() 
        OR public.is_member_of_channel(m.channel_id)
      )
    )
  )
);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'message_attachments'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id::text = (storage.foldername(name))[1]
    AND m.user_id = auth.uid()
  )
);

-- Add attachments column to messages table
ALTER TABLE public.messages 
ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Add content_type column to differentiate between plain text and rich content
ALTER TABLE public.messages 
ADD COLUMN content_type TEXT DEFAULT 'text';

-- Create index for better performance
CREATE INDEX idx_messages_attachments ON public.messages USING GIN(attachments);