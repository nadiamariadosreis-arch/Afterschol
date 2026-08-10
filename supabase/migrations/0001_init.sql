-- Cérebro em Jogo — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).
-- Projeto Supabase independente do usado pela Trilha das Virtudes.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tipos
-- =========================================================================

create type public.user_role as enum ('member', 'admin');
create type public.tag_type as enum ('queixa', 'virtude');

-- =========================================================================
-- profiles — estende auth.users (uma linha por conta de família ou admin)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Cria a linha em profiles automaticamente quando um usuário se cadastra
-- (ex: quando é convidada pela admin em /admin/membros).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper usado nas policies de RLS.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================================
-- tags — queixas das mães e virtudes buscadas, usadas para filtrar jogos
-- =========================================================================

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  type public.tag_type not null,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- jogos — cada jogo pedagógico disponível na plataforma
-- =========================================================================

create table public.jogos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  resumo text,
  como_jogar text, -- texto explicando as regras do jogo
  como_ajuda text, -- explicação pedagógica: por que esse jogo ajuda com a queixa/virtude
  video_url text, -- videoaula mostrando o jogo
  pdf_path text, -- caminho no bucket privado 'jogos-pdf'
  capa_path text, -- caminho no bucket público 'jogos-capas'
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- jogo_tags — relação N:N entre jogos e tags (queixas/virtudes)
-- =========================================================================

create table public.jogo_tags (
  jogo_id uuid not null references public.jogos (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (jogo_id, tag_id)
);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.jogos enable row level security;
alter table public.jogo_tags enable row level security;

-- profiles
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- tags (metadados legíveis por qualquer usuário autenticado)
create policy "tags: authenticated read" on public.tags
  for select using (auth.uid() is not null);
create policy "tags: admin write" on public.tags
  for insert with check (public.is_admin());
create policy "tags: admin update" on public.tags
  for update using (public.is_admin());
create policy "tags: admin delete" on public.tags
  for delete using (public.is_admin());

-- jogos (famílias só veem jogos publicados; admin vê tudo)
create policy "jogos: authenticated read" on public.jogos
  for select using (auth.uid() is not null and (published or public.is_admin()));
create policy "jogos: admin write" on public.jogos
  for insert with check (public.is_admin());
create policy "jogos: admin update" on public.jogos
  for update using (public.is_admin());
create policy "jogos: admin delete" on public.jogos
  for delete using (public.is_admin());

-- jogo_tags
create policy "jogo_tags: authenticated read" on public.jogo_tags
  for select using (auth.uid() is not null);
create policy "jogo_tags: admin write" on public.jogo_tags
  for insert with check (public.is_admin());
create policy "jogo_tags: admin update" on public.jogo_tags
  for update using (public.is_admin());
create policy "jogo_tags: admin delete" on public.jogo_tags
  for delete using (public.is_admin());

-- =========================================================================
-- Storage
-- =========================================================================

-- Bucket privado para os PDFs dos jogos — a marca d'água é aplicada e
-- servida pela rota /api/pdf/[jogoId], famílias nunca acessam o bucket
-- diretamente.
insert into storage.buckets (id, name, public)
values ('jogos-pdf', 'jogos-pdf', false)
on conflict (id) do nothing;

create policy "jogos-pdf bucket: admin manage"
  on storage.objects for all
  using (bucket_id = 'jogos-pdf' and public.is_admin())
  with check (bucket_id = 'jogos-pdf' and public.is_admin());

-- Bucket público para as capas dos jogos (thumbnails na busca).
insert into storage.buckets (id, name, public)
values ('jogos-capas', 'jogos-capas', true)
on conflict (id) do nothing;

create policy "jogos-capas bucket: public read"
  on storage.objects for select
  using (bucket_id = 'jogos-capas');

create policy "jogos-capas bucket: admin write"
  on storage.objects for insert
  with check (bucket_id = 'jogos-capas' and public.is_admin());

create policy "jogos-capas bucket: admin update"
  on storage.objects for update
  using (bucket_id = 'jogos-capas' and public.is_admin());

create policy "jogos-capas bucket: admin delete"
  on storage.objects for delete
  using (bucket_id = 'jogos-capas' and public.is_admin());
