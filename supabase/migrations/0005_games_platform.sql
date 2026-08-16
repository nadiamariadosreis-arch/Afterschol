-- Jogos católicos educativos — catálogo estilo Netflix.
-- Rode este arquivo no SQL Editor do Supabase.

create table public.game_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.game_categories (id) on delete set null,
  title text not null,
  description text,
  age_range text,
  cover_image_path text, -- caminho no bucket público 'covers'
  video_url text,
  pdf_path text, -- caminho no bucket privado 'content'
  instructions text, -- markdown, mesmo formato do Guia dos Pais
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.game_categories enable row level security;
alter table public.games enable row level security;

create policy "game_categories: public read" on public.game_categories
  for select using (true);
create policy "game_categories: admin write" on public.game_categories
  for insert with check (public.is_admin());
create policy "game_categories: admin update" on public.game_categories
  for update using (public.is_admin());
create policy "game_categories: admin delete" on public.game_categories
  for delete using (public.is_admin());

create policy "games: authenticated read" on public.games
  for select using (auth.uid() is not null);
create policy "games: admin write" on public.games
  for insert with check (public.is_admin());
create policy "games: admin update" on public.games
  for update using (public.is_admin());
create policy "games: admin delete" on public.games
  for delete using (public.is_admin());

insert into public.game_categories (name, sort_order) values
  ('Atenção', 1),
  ('Memória', 2),
  ('Raciocínio Lógico', 3),
  ('Autocontrole', 4),
  ('Linguagem', 5);

-- Reaproveita o produto único já existente — agora libera o catálogo de jogos.
update public.products
set name = 'Acesso Completo', description = 'Acesso a todo o catálogo de jogos.'
where code = 'pacote_completo';

notify pgrst, 'reload schema';
