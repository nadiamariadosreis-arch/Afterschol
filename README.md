# Método A.P.F.A — Finanças para Famílias Católicas

Plataforma de área de membros onde famílias organizam as finanças
mensalmente seguindo o Método A.P.F.A: **A**valiar, **P**lanejar, **F**azer
Acontecer, **A**companhar. O dinheiro é dividido em 4 processos —
Essencial, Compromissos, Futuro e Presente — e cada mês é um ciclo
completo guiado como um curso, não como uma planilha.

> Este projeto é independente das outras plataformas da mesma conta.
> Nenhum arquivo, schema ou histórico é compartilhado.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — autenticação, banco de dados (Postgres + RLS) e storage dos PDFs de fatura

## Como o método está modelado

Cada família tem uma linha em `public.cycles` por mês (`year` + `month`,
únicos por família). Os dados de cada pilar ficam em colunas `jsonb`
(`avaliar`, `planejar`, `fazer_acontecer`, `acompanhar`) — o formato de
cada campo é a fonte da verdade em `src/lib/apfa/types.ts`. Um pilar é
considerado concluído quando seu `completed_at` está preenchido.

**Inteligência de data** (`src/lib/apfa/ciclo.ts`,
`getOrCreateActiveCycle`): a plataforma sempre trabalha no ciclo mais
recente que ainda não foi fechado (nem todos os 4 pilares concluídos) —
mesmo que um novo mês já tenha começado, para não pular nada de um mês
atrasado. Só quando o ciclo mais recente está fechado é que um novo ciclo
é aberto para o mês calendário atual, herdando os percentuais
recalibrados no Acompanhar anterior.

**Modelo freemium**: o cadastro em `/cadastro` é livre e grátis, e dá
acesso ao Pilar 1 (Avaliar) — o diagnóstico. Os Pilares 2-4 (Planejar,
Fazer Acontecer, Acompanhar) ficam bloqueados (`src/components/member/Paywall.tsx`)
até `profiles.paid` virar `true`, o que só acontece via o webhook da
Kiwify na compra aprovada (`src/app/api/webhooks/kiwify/route.ts`).

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (**diferente**
   dos projetos usados pelas outras plataformas).
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`
   e depois `supabase/migrations/0002_paid_flag.sql`, nessa ordem. Isso cria
   as tabelas, as políticas de RLS, o bucket de storage privado `faturas`
   (upload de fatura de cartão no Planejar) e a coluna `paid` que libera os
   Pilares 2-4 depois da compra.
3. Em **Authentication → Email Templates**, revise o template de
   "Confirm signup" (cadastro direto em `/cadastro`), "Invite user" (convite
   disparado pelo webhook da Kiwify) e "Reset password".
4. Em **Authentication → URL Configuration**, adicione a URL do site
   (local e de produção) em "Redirect URLs".

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chaves públicas do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, nunca expor no client.
- `NEXT_PUBLIC_SITE_URL` — URL pública do site.
- `KIWIFY_WEBHOOK_SECRET` — token que a rota do webhook exige na query string (`?token=...`). Escolha uma string aleatória e configure a mesma na Kiwify.
- `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL` — link de checkout do produto, usado no botão "Liberar acesso completo".

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O cadastro é direto (`/cadastro`) — não
depende de convite de admin, já que o produto é vendido no anonimato,
sem área administrativa.

## Vendendo pela Kiwify

1. Crie o produto na Kiwify e copie o link de checkout — cole em
   `NEXT_PUBLIC_KIWIFY_CHECKOUT_URL`.
2. Na Kiwify: **Produto → Webhooks → Criar webhook**. A Kiwify não manda um
   campo de "status aprovado" dentro dos dados — é o **evento que você
   marca na hora de criar o webhook** que decide quando ela chama a
   plataforma. Marque **só** o evento **"Compra aprovada"** (não marque
   "Compra recusada", "Reembolsada", "Chargeback" etc. no mesmo webhook).
3. Aponte a URL do webhook para:
   `https://SEU-DOMINIO/api/webhooks/kiwify?token=SEU_KIWIFY_WEBHOOK_SECRET`
   (o mesmo valor de `KIWIFY_WEBHOOK_SECRET`).
4. Faça uma compra de teste (a Kiwify tem um modo de teste no próprio
   produto) pra confirmar que o acesso libera de verdade. Se der erro,
   confira os logs do webhook no painel da Kiwify (ela mostra o payload
   enviado e a resposta) — o formato dos campos usados aqui
   (`Customer.email`, `Customer.full_name`) já segue o padrão documentado
   pela Kiwify, mas pode variar por conta/plano.

O que o webhook faz na compra aprovada: se a família já tinha criado conta
de graça (para usar o Avaliar), só libera o acesso completo. Se ainda não
tinha conta, cria e já entrega liberada — a família define a senha pelo
link de convite que recebe por e-mail.

## Deploy

Qualquer host compatível com Next.js funciona (ex: Vercel). Configure as
mesmas variáveis de ambiente do `.env.local` no painel do host.
