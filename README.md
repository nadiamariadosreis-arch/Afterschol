# Afterschool Católico — Área de Membros

Plataforma de área de membros para o material de afterschooling católico —
20 livrinhos de virtude com atividades pedagógicas, organizados em 3
trilhas (Letras, Sílabas/Leitura, Gramática), liberados por semana.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — autenticação, banco de dados (Postgres + RLS) e storage dos PDFs
- **pdf-lib** — aplica a marca d'água (nome/e-mail da família) nos PDFs no momento da visualização/download

A identidade visual (cores, tipografia) está em `src/app/globals.css`, seguindo o playbook aquarela/livros-vivos.

## Setup

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`.
   Isso cria as tabelas, as políticas de RLS, o bucket de storage privado
   `content` e já cadastra os 3 produtos/trilhas (a Trilha de Letras vem
   marcada como disponível para venda; as demais como "em breve").
3. Em **Authentication → Email Templates**, revise os templates de
   "Invite user" e "Reset password" (são os e-mails que a família recebe
   ao ser cadastrada ou ao redefinir a senha).
4. Em **Authentication → URL Configuration**, adicione a URL do site
   (local e de produção) em "Redirect URLs".

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os dados do projeto
(**Project Settings → API**):

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chaves públicas.
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, nunca expor no client. Usada
  apenas em rotas de servidor para ler o bucket privado de PDFs e para
  convidar famílias.
- `NEXT_PUBLIC_SITE_URL` — URL pública do site (usada nos links de e-mail).
- `KIWIFY_WEBHOOK_SECRET` — só necessário quando a integração com a Kiwify
  for ativada (veja abaixo).

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### 4. Criar o primeiro acesso de administradora

Toda conta nova nasce com o papel `family`. Para se tornar admin:

1. Vá em `/admin/familias`... ainda não — como você ainda não é admin,
   convide sua própria conta pelo **SQL Editor** do Supabase, ou:
2. Cadastre-se normalmente (peça para alguém te convidar, ou insira o
   usuário manualmente em **Authentication → Users → Invite user**).
3. No SQL Editor, promova a conta:

   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
   ```

4. Depois disso, o menu "Administração" aparece no cabeçalho ao logar, e
   você pode convidar as demais famílias por `/admin/familias`.

## Como o conteúdo é organizado

- **Virtudes** (`/admin/virtudes`) — os 20 livrinhos. Cada um tem um
  número, nome e o PDF do livrinho.
- **Trilhas e Semanas** (`/admin/trilhas`) — cada trilha (Letras,
  Sílabas, Gramática) tem suas próprias semanas. Uma semana liga uma
  virtude à trilha, define a **data de liberação**, o PDF de atividades
  e o link do vídeo-aula.
- **Produtos e Acessos** (`/admin/produtos`) — controla o que está à
  venda (hoje, só a Trilha de Letras) e o link de checkout.
- **Famílias** (`/admin/familias`) — convida famílias e concede/revoga
  acesso manualmente às trilhas, enquanto a Kiwify não está integrada.

Uma família só enxerga uma trilha se tiver o **entitlement**
correspondente (comprou a trilha avulsa ou o pacote completo) — e dentro
da trilha, só as semanas cuja `release_date` já passou.

## Marca d'água nos PDFs

Os PDFs originais ficam num bucket privado do Supabase Storage, nunca
expostos diretamente. A rota `src/app/api/pdf/[weekId]/route.ts`:

1. Confirma que a família está logada e tem acesso àquela trilha/semana.
2. Baixa o PDF original com a service role key.
3. Usa `pdf-lib` para aplicar uma marca d'água discreta e diagonal (nome
   + e-mail da família) em todas as páginas.
4. Serve o resultado — `?mode=download` força o download, sem o
   parâmetro o PDF é exibido inline (usado pelo visualizador embutido).

## Integração futura com a Kiwify

O placeholder está em `src/app/api/webhooks/kiwify/route.ts`, com
instruções em comentário sobre os 3 passos para ativar (confirmar o
payload real do webhook, configurar `KIWIFY_WEBHOOK_SECRET`, e mapear
`products.kiwify_product_id` a cada produto). Até lá, o acesso é
concedido manualmente pela admin em `/admin/familias`.

## Deploy

Qualquer host compatível com Next.js funciona (ex: Vercel). Configure as
mesmas variáveis de ambiente do `.env.local` no painel do host.
