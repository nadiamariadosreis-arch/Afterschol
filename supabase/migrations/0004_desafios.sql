-- Método A.P.F.A — aba Desafios
-- Rode este arquivo no SQL Editor do Supabase, depois do 0003_paid_until.sql.
--
-- Desafios comportamentais financeiros (semana/mês) que a família escolhe
-- livremente — o catálogo fixo vive em `src/lib/apfa/desafios.ts`, esta
-- tabela só guarda o progresso de cada família por desafio.

create table public.desafios_progresso (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  chave text not null,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  created_at timestamptz not null default now(),
  unique (family_id, chave)
);

alter table public.desafios_progresso enable row level security;

create policy "desafios_progresso: family read" on public.desafios_progresso
  for select using (family_id = auth.uid() or public.is_admin());
create policy "desafios_progresso: family insert" on public.desafios_progresso
  for insert with check (family_id = auth.uid());
create policy "desafios_progresso: family update" on public.desafios_progresso
  for update using (family_id = auth.uid() or public.is_admin());
create policy "desafios_progresso: family delete" on public.desafios_progresso
  for delete using (family_id = auth.uid());
