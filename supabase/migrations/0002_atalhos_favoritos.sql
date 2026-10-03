-- Arsenal Zero Telas — atalhos rápidos (tags flexíveis) + favoritos
-- Rode depois do 0001_init.sql no SQL Editor do Supabase.

-- =========================================================================
-- tags.type vira texto livre, em vez de enum fixo — assim a admin pode
-- criar novos tipos de atalho (idade, tempo disponível, tipo de
-- atividade, sozinha/com adulto...) sem precisar de outra migration.
-- A lista de tipos sugeridos vive no código (src/lib/tagStyle.ts).
-- =========================================================================

alter table public.tags alter column type type text using type::text;
drop type if exists public.tag_type;

-- =========================================================================
-- favoritos — cada família marca as atividades que já funcionaram
-- =========================================================================

create table public.favoritos (
  member_id uuid not null references public.profiles (id) on delete cascade,
  jogo_id uuid not null references public.jogos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, jogo_id)
);

alter table public.favoritos enable row level security;

create policy "favoritos: owner manage own" on public.favoritos
  for all
  using (member_id = auth.uid() or public.is_admin())
  with check (member_id = auth.uid() or public.is_admin());
