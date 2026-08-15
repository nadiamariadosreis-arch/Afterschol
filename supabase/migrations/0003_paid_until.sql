-- Método A.P.F.A — acesso pago passa a ter validade de 1 ano, não vitalício.
-- Rode este arquivo no SQL Editor do Supabase, depois do 0002_paid_flag.sql.
--
-- `paid` continua marcando se a família já comprou alguma vez; `paid_until`
-- guarda até quando esse acesso vale. O webhook em
-- src/app/api/webhooks/kiwify/route.ts seta os dois numa compra aprovada.
-- O acesso de verdade é decidido por `temAcessoPago()` em src/lib/auth.ts,
-- que checa `paid = true AND (paid_until IS NULL OR paid_until > now())`.

alter table public.profiles
  add column if not exists paid_until timestamptz;
