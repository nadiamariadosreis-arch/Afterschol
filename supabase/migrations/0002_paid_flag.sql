-- Método A.P.F.A — modelo freemium
-- Rode este arquivo no SQL Editor do Supabase, depois do 0001_init.sql.
--
-- Avaliar (Pilar 1) é gratuito para qualquer conta cadastrada. Planejar,
-- Fazer Acontecer e Acompanhar (Pilares 2-4) só ficam liberados depois de
-- uma compra aprovada na Kiwify — o webhook em
-- src/app/api/webhooks/kiwify/route.ts marca `paid = true` na família.

alter table public.profiles
  add column if not exists paid boolean not null default false;
