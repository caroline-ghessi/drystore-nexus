-- Torna o bucket de anexos de mensagens público e adiciona política de leitura
-- Idempotente: atualiza apenas se necessário e cria policy se ainda não existir

-- 1) Tornar bucket público
update storage.buckets
set public = true
where id = 'message_attachments';

-- 2) Política de leitura pública para objetos do bucket 'message_attachments'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read for message_attachments'
  ) THEN
    CREATE POLICY "Public read for message_attachments" 
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'message_attachments');
  END IF;
END $$;