-- Método A.P.F.A — propósito da família ("seu porquê")
-- Rode este arquivo no SQL Editor do Supabase, depois do 0004_desafios.sql.
--
-- Motivo emocional que sustenta a disciplina no longo prazo (ex: "dar
-- estabilidade pros meus filhos") — definido uma vez, editável a qualquer
-- momento em Minha Conta, e reforçado como lembrete no Avaliar.

alter table public.profiles
  add column if not exists proposito text;
