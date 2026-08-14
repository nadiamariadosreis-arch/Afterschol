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

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (**diferente**
   dos projetos usados pelas outras plataformas).
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`.
   Isso cria as tabelas, as políticas de RLS e o bucket de storage privado
   `faturas` (upload de fatura de cartão no Planejar).
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
- `KIWIFY_WEBHOOK_SECRET` — opcional, só quando a automação de pagamento for ativada.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O cadastro é direto (`/cadastro`) — não
depende de convite de admin, já que o produto é vendido no anonimato,
sem área administrativa.

## Integração futura com pagamentos

O placeholder está em `src/app/api/webhooks/kiwify/route.ts`. Quando a
venda estiver ativa na Kiwify, aponte o webhook de "compra aprovada" para
essa rota — ela convida a família por e-mail. Até lá, o cadastro direto em
`/cadastro` já funciona sozinho.

## Deploy

Qualquer host compatível com Next.js funciona (ex: Vercel). Configure as
mesmas variáveis de ambiente do `.env.local` no painel do host.
