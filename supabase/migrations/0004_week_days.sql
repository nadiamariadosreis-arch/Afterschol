-- Dias da semana dentro de uma semana (ex: Segunda, Terça...), cada um com
-- texto próprio (mesmo estilo markdown do Guia dos Pais) e um PDF opcional.
-- Rode este arquivo no SQL Editor do Supabase.

create table public.week_days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  day_number integer not null,
  label text not null,
  content text,
  pdf_path text, -- caminho no bucket privado 'content'
  created_at timestamptz not null default now(),
  unique (week_id, day_number)
);

alter table public.week_days enable row level security;

create policy "week_days: authenticated read" on public.week_days
  for select using (auth.uid() is not null);
create policy "week_days: admin write" on public.week_days
  for insert with check (public.is_admin());
create policy "week_days: admin update" on public.week_days
  for update using (public.is_admin());
create policy "week_days: admin delete" on public.week_days
  for delete using (public.is_admin());

notify pgrst, 'reload schema';
