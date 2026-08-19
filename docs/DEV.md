# Como rodar localmente

1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: criadas em Settings → API
     do seu projeto Supabase.
   - `ANTHROPIC_API_KEY`: em console.anthropic.com (usada só no servidor).
3. Rode a migration em `supabase/migrations/0001_init.sql` no seu projeto Supabase (SQL
   Editor, ou `supabase db push` se estiver usando a CLI).
4. `npm run dev` e abra http://localhost:3000

## Estrutura

- `src/app/login`, `src/app/cadastro`: autenticação (Supabase Auth, email + senha).
- `src/app/dashboard`: lista de perfis do usuário ("projetos" isolados, um por Instagram).
- `src/app/perfil/[id]/*`: os 5 módulos do fluxo — nicho, identidade, conteúdo, calendário,
  grid (o checklist de crescimento orgânico fica dentro da etapa de grid).
- `src/lib/ai`: prompts e client da Anthropic — toda chamada de IA roda no servidor
  (Server Actions), a chave nunca é exposta ao navegador.
- `src/lib/supabase`: clients de browser/servidor/middleware do Supabase.
- `supabase/migrations`: schema do banco com RLS por usuário.

## Notas

- O middleware (`src/middleware.ts`) hoje usa a convenção `middleware.ts` do Next.js; a versão
  do Next instalada já sinaliza essa convenção como depreciada em favor de `proxy.ts`. Funciona
  normalmente, mas vale rodar `npx @next/codemod@canary middleware-to-proxy .` numa branch limpa
  quando for atualizar o Next.
- Sem integração com a API oficial do Instagram e sem cobrança — ver `README.md` para o escopo
  completo e o que fica para fases futuras.
