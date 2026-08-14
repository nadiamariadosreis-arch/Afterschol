-- Método A.P.F.A — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).
-- Projeto Supabase independente das outras plataformas da mesma conta.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tipos
-- =========================================================================

create type public.user_role as enum ('member', 'admin');

-- =========================================================================
-- profiles — estende auth.users (uma linha por conta de família)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  family_name text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Cria a linha em profiles automaticamente quando uma conta é criada
-- (cadastro direto ou convite disparado pelo webhook da Kiwify).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, family_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'family_name');
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
-- cycles — um ciclo mensal por família (Avaliar → Planejar → Fazer
-- Acontecer → Acompanhar). Cada pilar guarda seus dados guiados em jsonb:
-- o formato de cada campo é a fonte da verdade em `src/lib/apfa/types.ts`.
-- =========================================================================

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  percentuais jsonb not null default '{"essencial":60,"compromissos":10,"futuro":15,"presente":15}'::jsonb,
  avaliar jsonb,
  planejar jsonb,
  fazer_acontecer jsonb,
  acompanhar jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, year, month)
);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cycles_set_updated_at
  before update on public.cycles
  for each row execute procedure public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.cycles enable row level security;

-- profiles
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- cycles (cada família só vê e edita seus próprios ciclos)
create policy "cycles: family read" on public.cycles
  for select using (family_id = auth.uid() or public.is_admin());
create policy "cycles: family insert" on public.cycles
  for insert with check (family_id = auth.uid());
create policy "cycles: family update" on public.cycles
  for update using (family_id = auth.uid() or public.is_admin());
create policy "cycles: family delete" on public.cycles
  for delete using (family_id = auth.uid());

-- =========================================================================
-- Storage — PDFs de fatura de cartão enviados no Pilar Planejar
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('faturas', 'faturas', false)
on conflict (id) do nothing;

create policy "faturas: family manage own folder"
  on storage.objects for all
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'faturas' and (storage.foldername(name))[1] = auth.uid()::text);
