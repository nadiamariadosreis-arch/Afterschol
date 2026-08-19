-- Schema inicial da plataforma de estruturação de Instagram para crescimento orgânico.
-- Cada tabela é isolada por usuário via RLS (auth.uid() = user_id).

create extension if not exists "pgcrypto";

-- Perfis planejados. Um usuário pode estruturar mais de um perfil (nichos diferentes).
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Novo perfil',
  status text not null default 'nicho' check (status in ('nicho', 'identidade', 'conteudo', 'calendario', 'ativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nicho pesquisado/escolhido para um perfil.
create table if not exists niches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  input_interest text not null,
  suggestions jsonb not null default '[]'::jsonb,
  chosen_niche text,
  chosen_audience text,
  chosen_rationale text,
  created_at timestamptz not null default now()
);

-- Identidade de marca pessoal gerada/editada para o perfil.
create table if not exists identities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username_suggestion text,
  bio text,
  value_proposition text,
  tone_of_voice text,
  color_palette jsonb not null default '[]'::jsonb,
  content_pillars jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pautas de conteúdo geradas (posts/reels/stories).
create table if not exists content_pieces (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null check (format in ('reels', 'carrossel', 'foto_unica', 'stories')),
  theme text not null,
  hook text,
  script text,
  caption text,
  grid_order int,
  scheduled_date date,
  status text not null default 'pauta' check (status in ('pauta', 'agendado', 'publicado')),
  created_at timestamptz not null default now()
);

create index if not exists content_pieces_profile_idx on content_pieces(profile_id);
create index if not exists content_pieces_schedule_idx on content_pieces(profile_id, scheduled_date);

alter table profiles enable row level security;
alter table niches enable row level security;
alter table identities enable row level security;
alter table content_pieces enable row level security;

create policy "profiles_owner" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "niches_owner" on niches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "identities_owner" on identities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "content_pieces_owner" on content_pieces
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
