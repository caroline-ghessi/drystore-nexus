-- Create private bucket for document attachments
insert into storage.buckets (id, name, public)
values ('document_attachments', 'document_attachments', false)
on conflict (id) do nothing;

-- Helper to extract document UUID from storage object path like: documents/<uuid>/filename.ext
create or replace function public.get_document_id_from_path(path text)
returns uuid
language plpgsql
stable
security definer
set search_path to ''
as $$
declare
  m text[];
begin
  -- Prefer pattern documents/<uuid>/...
  m := regexp_match(path, 'documents/([0-9a-fA-F-]{36})/');
  if m is null then
    -- Fallback: first UUID anywhere in the path
    m := regexp_match(path, '([0-9a-fA-F-]{36})');
  end if;
  if m is not null then
    return m[1]::uuid;
  end if;
  return null;
end;
$$;

-- Policies for storage.objects specifically for document_attachments bucket
-- View attachments if user can access the related document OR is admin
create policy if not exists "View document attachments when permitted"
  on storage.objects
  for select
  using (
    bucket_id = 'document_attachments'
    and (
      public.can_access_document(public.get_document_id_from_path(name))
      or public.is_current_user_admin()
    )
  );

-- Upload with write permission to the related document or admin
create policy if not exists "Upload attachments with write permission"
  on storage.objects
  for insert
  with check (
    bucket_id = 'document_attachments'
    and (
      public.has_document_permission(public.get_document_id_from_path(name), 'write')
      or public.is_current_user_admin()
    )
  );

-- Update with write permission or admin
create policy if not exists "Update attachments with write permission"
  on storage.objects
  for update
  using (
    bucket_id = 'document_attachments'
    and (
      public.has_document_permission(public.get_document_id_from_path(name), 'write')
      or public.is_current_user_admin()
    )
  )
  with check (bucket_id = 'document_attachments');

-- Delete with write permission or admin
create policy if not exists "Delete attachments with write permission"
  on storage.objects
  for delete
  using (
    bucket_id = 'document_attachments'
    and (
      public.has_document_permission(public.get_document_id_from_path(name), 'write')
      or public.is_current_user_admin()
    )
  );