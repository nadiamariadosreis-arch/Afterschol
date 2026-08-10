-- Texto livre por semana (introdução/descrição), editável pela admin
-- direto no painel — sem precisar mexer em código.
-- Rode este arquivo no SQL Editor do Supabase depois do 0002_track_covers.sql.

alter table public.weeks add column if not exists description text;
