-- Progresso de gamificação por usuário: XP acumulado e sequência de dias ativos.

create table if not exists user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  streak_days int not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table user_progress enable row level security;

create policy "user_progress_owner" on user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
