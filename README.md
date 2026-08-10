# Cérebro em Jogo — Plataforma de Jogos Pedagógicos

Plataforma de área de membros com jogos pedagógicos voltados à
alfabetização e à formação de virtudes, com base em neuroplasticidade.
Cada jogo é organizado por **queixa da mãe** (ex: "meu filho chora muito
para fazer as coisas") e/ou **virtude buscada** (ex: paciência,
autocontrole), para facilitar a busca pelo desafio que a família está
enfrentando.

> Este projeto é independente da plataforma "Trilha das Virtudes"
> (branch `claude/afterschooling-member-platform-l1x49s`). Nenhum
> arquivo, schema ou histórico é compartilhado entre os dois.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — autenticação, banco de dados (Postgres + RLS) e storage dos PDFs/capas
- **pdf-lib** — aplica marca d'água (nome/e-mail da família) nos PDFs dos jogos no momento do download

## Como o conteúdo é organizado

- **Tags** (`/admin/tags`) — as queixas das mães e as virtudes buscadas.
  Cada tag tem um tipo (`queixa` ou `virtude`), nome e slug.
- **Jogos** (`/admin/jogos`) — cada jogo tem: título, resumo, explicação
  de como jogar, explicação de como ele ajuda a criança a vencer o
  desafio/alcançar a virtude, PDF para download, capa e vídeo-aula. Cada
  jogo pode ser marcado com uma ou mais tags.
- **Membros** (`/admin/membros`) — convida famílias. Toda conta convidada
  já nasce com acesso completo à biblioteca de jogos (assinatura única,
  sem trilhas separadas).

Na área de membros, a família busca por texto livre ou filtra pelas tags
(queixa/virtude) e acessa a página do jogo — que tem a videoaula, o texto
de como jogar, o PDF para baixar e a explicação pedagógica.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (**diferente**
   do projeto usado pela Trilha das Virtudes).
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`.
   Isso cria as tabelas, as políticas de RLS e os buckets de storage
   (`jogos-pdf` privado e `jogos-capas` público).
3. Em **Authentication → Email Templates**, revise o template de "Invite
   user" (o e-mail que a família recebe ao ser convidada) e o de "Reset
   password".
4. Em **Authentication → URL Configuration**, adicione a URL do site
   (local e de produção) em "Redirect URLs".

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chaves públicas do **novo** projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, nunca expor no client.
- `NEXT_PUBLIC_SITE_URL` — URL pública do site.
- `KIWIFY_WEBHOOK_SECRET` — opcional, só quando a automação de pagamento for ativada.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### 4. Criar o primeiro acesso de administradora

Toda conta nova nasce com o papel `member`. Para virar admin, promova a
conta pelo SQL Editor do Supabase:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
```

## Marca d'água nos PDFs

Os PDFs dos jogos ficam num bucket privado do Supabase Storage. A rota
`src/app/api/pdf/[jogoId]/route.ts` confirma que a família está logada,
baixa o PDF original com a service role key, aplica uma marca d'água
diagonal (nome + e-mail da família) com `pdf-lib` e serve o resultado.

## Integração futura com pagamentos

O placeholder está em `src/app/api/webhooks/kiwify/route.ts`. Até a
automação ser ativada, o acesso é concedido manualmente pela admin em
`/admin/membros`.

## Deploy

Qualquer host compatível com Next.js funciona (ex: Vercel). Configure as
mesmas variáveis de ambiente do `.env.local` no painel do host.
