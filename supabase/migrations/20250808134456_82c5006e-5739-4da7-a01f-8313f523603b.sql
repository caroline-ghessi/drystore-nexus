
-- 1) Tabela de anúncios
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  category text,
  priority text not null default 'normal' check (priority in ('urgent','important','normal','info')),
  is_pinned boolean not null default false,
  publish_date timestamptz not null default now(),
  author_user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS
alter table public.announcements enable row level security;

-- Políticas
-- Leitura: visível para todos (se preferir apenas autenticados, troque 'true' por 'auth.uid() is not null')
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Announcements are viewable by everyone'
  ) then
    create policy "Announcements are viewable by everyone"
      on public.announcements
      for select
      using (true);
  end if;
end $$;

-- Inserir somente admins
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Only admins can insert announcements'
  ) then
    create policy "Only admins can insert announcements"
      on public.announcements
      for insert
      with check (is_current_user_admin());
  end if;
end $$;

-- Atualizar somente admins
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Only admins can update announcements'
  ) then
    create policy "Only admins can update announcements"
      on public.announcements
      for update
      using (is_current_user_admin());
  end if;
end $$;

-- Deletar somente admins
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Only admins can delete announcements'
  ) then
    create policy "Only admins can delete announcements"
      on public.announcements
      for delete
      using (is_current_user_admin());
  end if;
end $$;

-- Trigger para updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'set_announcements_updated_at'
  ) then
    create trigger set_announcements_updated_at
      before update on public.announcements
      for each row
      execute function public.update_updated_at_column();
  end if;
end $$;

-- 2) Bucket de Storage para imagens dos anúncios
-- Cria o bucket (público) se ainda não existir
insert into storage.buckets (id, name, public)
values ('announcements', 'announcements', true)
on conflict (id) do nothing;

-- Políticas do bucket na storage.objects
-- Leitura pública para arquivos do bucket 'announcements'
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read on announcements bucket'
  ) then
    create policy "Public read on announcements bucket"
      on storage.objects
      for select
      using (bucket_id = 'announcements');
  end if;
end $$;

-- Upload (INSERT) apenas admins no bucket 'announcements'
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload to announcements'
  ) then
    create policy "Admins can upload to announcements"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'announcements' and public.is_current_user_admin());
  end if;
end $$;

-- UPDATE apenas admins
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update announcements files'
  ) then
    create policy "Admins can update announcements files"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'announcements' and public.is_current_user_admin());
  end if;
end $$;

-- DELETE apenas admins
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete announcements files'
  ) then
    create policy "Admins can delete announcements files"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'announcements' and public.is_current_user_admin());
  end if;
end $$;
