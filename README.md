# Casa em Ordem — Acompanhamento

App de acompanhamento do método **Casa em Ordem**: um passo a passo pra colocar em prática, no dia a dia, tudo que está no PDF do curso.

Conteúdo do app, espelhando as partes do método:

- **Hoje** — dashboard do dia: diagnóstico de ponto de partida, mínimo viável, dia do plano de 21, zona da semana.
- **Mínimo viável** (Parte 3) — as tarefas não negociáveis, com streak. Customizável.
- **Rotina por tempo** (Parte 4) — rotinas de 15, 30 e 60 minutos.
- **Sistema semanal** (Parte 5) — ciclo de 5 zonas da casa, com banco de tarefas customizável, ordem reordenável e semana atual definida manualmente.
- **Reset da casa** (Parte 6) — protocolo guiado de 5 passos.
- **Roupa, cozinha e brinquedos** (Parte 7) — regras dos três pontos de acúmulo.
- **Crianças que ajudam** (Parte 8) — tarefas por faixa etária.
- **Rotina diária** (Parte 9) — manhã, chegada em casa e noite.
- **Plano de 21 dias** (Parte 10) — as 3 semanas de implementação, com calendário de progresso.
- **Sobre o método** (Partes 1-2) — os 3 erros e os 4 pilares.

Todo o progresso é salvo no `localStorage` do navegador — sem backend, sem contas de usuário.

É um PWA: instalável na tela inicial do celular/computador, ícone próprio, abre em tela cheia.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

Gera um site estático em `dist/`, pronto pra hospedar em qualquer serviço (Vercel, Netlify, GitHub Pages etc.).

## Código de acesso

O app tem uma tela de código de acesso antes de entrar (útil pra vender o acesso junto com o PDF). Configure em `.env` (copie de `.env.example`):

```
VITE_ACCESS_CODE=seu-codigo-aqui
```

No deploy (Vercel/Netlify), configure a mesma variável em "Environment Variables" no painel do serviço. Sem essa variável, o app usa `casaemordem` como código padrão.

**Importante:** como o app é 100% estático (sem backend), esse código não é segurança de verdade — é um filtro simples pra distribuir junto com o e-mail de compra. Alguém tecnicamente capaz consegue inspecionar o código e contornar. Pra travar o acesso por comprador de forma robusta (um login por pessoa), é preciso adicionar autenticação com backend (ex: Supabase).

## Deploy sugerido

1. Suba este repositório no GitHub (já feito).
2. Crie uma conta na [Vercel](https://vercel.com) (tem plano grátis) e importe o repositório.
3. Configure a variável `VITE_ACCESS_CODE` nas configurações do projeto.
4. Deploy — a Vercel detecta automaticamente que é um projeto Vite.
5. Venda o PDF + acesso ao app via uma plataforma como Hotmart ou Kiwify, entregando o link do app e o código de acesso no e-mail de confirmação da compra.
