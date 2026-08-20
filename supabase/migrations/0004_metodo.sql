-- Módulo "Método": extrai a estrutura do material pago do criador (resultado, pilares,
-- processos) para orientar a geração de conteúdo gratuito no mesmo estilo do produto.

alter table profiles drop constraint if exists profiles_status_check;
alter table profiles add constraint profiles_status_check
  check (status in ('nicho', 'identidade', 'metodo', 'conteudo', 'calendario', 'ativo'));

create table if not exists methods (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  desired_result text,
  notes text,
  pillars jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Materiais de origem enviados (PDFs de cursos, apostilas etc.), com resumo gerado por IA.
create table if not exists method_sources (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references methods(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_path text not null,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists methods_profile_idx on methods(profile_id);
create index if not exists method_sources_method_idx on method_sources(method_id);

alter table methods enable row level security;
alter table method_sources enable row level security;

create policy "methods_owner" on methods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "method_sources_owner" on method_sources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: bucket privado para os PDFs enviados, um "diretório" por usuário
-- (primeiro segmento do caminho = auth.uid()), com RLS restringindo cada
-- usuário aos seus próprios arquivos.
insert into storage.buckets (id, name, public)
values ('method-materials', 'method-materials', false)
on conflict (id) do nothing;

create policy "method_materials_owner_select" on storage.objects
  for select using (
    bucket_id = 'method-materials' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "method_materials_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'method-materials' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "method_materials_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'method-materials' and auth.uid()::text = (storage.foldername(name))[1]
  );
