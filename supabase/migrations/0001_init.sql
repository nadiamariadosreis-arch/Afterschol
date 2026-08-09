-- Afterschool Católico — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tipos
-- =========================================================================

create type public.user_role as enum ('family', 'admin');
create type public.track_level as enum ('inicial', 'intermediario', 'avancado');
create type public.product_code as enum (
  'trilha_letras',
  'trilha_silabas',
  'trilha_gramatica',
  'pacote_completo'
);

-- =========================================================================
-- profiles — estende auth.users (uma linha por conta de família ou admin)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'family',
  created_at timestamptz not null default now()
);

-- Cria a linha em profiles automaticamente quando um usuário se cadastra.
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
-- child_profiles — perfis de crianças dentro de uma conta de família
-- =========================================================================

create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- products — o que pode ser vendido (trilha avulsa ou pacote completo)
-- =========================================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code public.product_code not null unique,
  name text not null,
  description text,
  price_cents integer,
  kiwify_product_id text,
  available_for_sale boolean not null default false,
  checkout_url text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- entitlements — o que cada família comprou/tem acesso
-- =========================================================================

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  product_code public.product_code not null references public.products (code),
  granted_at timestamptz not null default now(),
  source text not null default 'manual', -- 'manual' | 'kiwify'
  unique (family_id, product_code)
);

-- =========================================================================
-- tracks — as 3 trilhas
-- =========================================================================

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, -- 'letras' | 'silabas' | 'gramatica'
  name text not null,
  level public.track_level not null,
  product_code public.product_code not null references public.products (code),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- virtues — os 20 livrinhos de virtude
-- =========================================================================

create table public.virtues (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique, -- 1..20
  name text not null, -- ex: "Paciência"
  booklet_pdf_path text, -- caminho no bucket privado 'content'
  created_at timestamptz not null default now()
);

-- =========================================================================
-- weeks — a semana de uma trilha específica, ligada a uma virtude
-- =========================================================================

create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete cascade,
  virtue_id uuid not null references public.virtues (id) on delete cascade,
  week_number integer not null, -- posição sequencial dentro da trilha
  release_date date not null,
  activity_pdf_path text, -- caminho no bucket privado 'content'
  video_url text,
  created_at timestamptz not null default now(),
  unique (track_id, week_number)
);

-- =========================================================================
-- progress — progresso de cada criança em cada semana
-- =========================================================================

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  week_id uuid not null references public.weeks (id) on delete cascade,
  completed_at timestamptz,
  unique (child_profile_id, week_id)
);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.products enable row level security;
alter table public.entitlements enable row level security;
alter table public.tracks enable row level security;
alter table public.virtues enable row level security;
alter table public.weeks enable row level security;
alter table public.progress enable row level security;

-- profiles
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- child_profiles
create policy "child_profiles: family manage own" on public.child_profiles
  for all using (family_id = auth.uid() or public.is_admin())
  with check (family_id = auth.uid() or public.is_admin());

-- products (leitura pública — usada na landing page)
create policy "products: public read" on public.products
  for select using (true);
create policy "products: admin write" on public.products
  for insert with check (public.is_admin());
create policy "products: admin update" on public.products
  for update using (public.is_admin());
create policy "products: admin delete" on public.products
  for delete using (public.is_admin());

-- entitlements
create policy "entitlements: family read own" on public.entitlements
  for select using (family_id = auth.uid() or public.is_admin());
create policy "entitlements: admin write" on public.entitlements
  for insert with check (public.is_admin());
create policy "entitlements: admin update" on public.entitlements
  for update using (public.is_admin());
create policy "entitlements: admin delete" on public.entitlements
  for delete using (public.is_admin());

-- tracks (leitura pública — usada na landing page)
create policy "tracks: public read" on public.tracks
  for select using (true);
create policy "tracks: admin write" on public.tracks
  for insert with check (public.is_admin());
create policy "tracks: admin update" on public.tracks
  for update using (public.is_admin());
create policy "tracks: admin delete" on public.tracks
  for delete using (public.is_admin());

-- virtues (metadados legíveis por qualquer usuário autenticado; o PDF em si
-- só é servido pela rota de marca d'água, que checa o entitlement)
create policy "virtues: authenticated read" on public.virtues
  for select using (auth.uid() is not null);
create policy "virtues: admin write" on public.virtues
  for insert with check (public.is_admin());
create policy "virtues: admin update" on public.virtues
  for update using (public.is_admin());
create policy "virtues: admin delete" on public.virtues
  for delete using (public.is_admin());

-- weeks
create policy "weeks: authenticated read" on public.weeks
  for select using (auth.uid() is not null);
create policy "weeks: admin write" on public.weeks
  for insert with check (public.is_admin());
create policy "weeks: admin update" on public.weeks
  for update using (public.is_admin());
create policy "weeks: admin delete" on public.weeks
  for delete using (public.is_admin());

-- progress
create policy "progress: family manage own children" on public.progress
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.child_profiles cp
      where cp.id = progress.child_profile_id and cp.family_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.child_profiles cp
      where cp.id = progress.child_profile_id and cp.family_id = auth.uid()
    )
  );

-- =========================================================================
-- Seed — produtos e trilhas (estrutura, não conteúdo)
-- =========================================================================

insert into public.products (code, name, description, available_for_sale) values
  ('trilha_letras', 'Trilha de Letras', 'Identificação de letras — nível inicial.', true),
  ('trilha_silabas', 'Trilha de Sílabas/Leitura', 'Sílabas para começar a ler — nível intermediário.', false),
  ('trilha_gramatica', 'Trilha de Gramática', 'Separação silábica, sílaba tônica e classes gramaticais — nível avançado.', false),
  ('pacote_completo', 'Pacote Completo', 'Acesso às 3 trilhas.', false);

insert into public.tracks (slug, name, level, product_code, sort_order) values
  ('letras', 'Trilha de Letras', 'inicial', 'trilha_letras', 1),
  ('silabas', 'Trilha de Sílabas/Leitura', 'intermediario', 'trilha_silabas', 2),
  ('gramatica', 'Trilha de Gramática', 'avancado', 'trilha_gramatica', 3);

-- =========================================================================
-- Storage — bucket privado para os PDFs
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('content', 'content', false)
on conflict (id) do nothing;

create policy "content bucket: admin manage"
  on storage.objects for all
  using (bucket_id = 'content' and public.is_admin())
  with check (bucket_id = 'content' and public.is_admin());

-- Leitura dos originais fica restrita ao service role (usado pela rota de
-- marca d'água no servidor). Famílias nunca acessam o bucket diretamente.
