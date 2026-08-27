# Afterschol

Aplicativo web responsivo para criação e organização de rotinas familiares. Uma mãe
cadastra sua família, monta o perfil de cada criança, escolhe responsabilidades a
partir de um banco estruturado de tarefas (ou cria as suas), monta a rotina diária por
manhã/tarde/noite, organiza tarefas da semana e rotinas especiais, cria cards "Como
fazer" com passo a passo visual, e gera PDFs prontos para imprimir.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (design tokens em `src/index.css`)
- Zustand com persistência em `localStorage` (`src/store/useAppStore.ts`)
- React Router
- @dnd-kit (arrastar e reordenar tarefas na rotina)
- jsPDF (geração de PDF real, desenhado a partir de dados estruturados — nunca uma
  captura de tela da interface)

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção (roda tsc + vite build)
npm run lint      # oxlint
```

## Estrutura

- `src/types` — modelo de dados (usuária, família, criança, banco de tarefas,
  tarefa personalizada, rotina, tarefas da semana, rotina especial, card "Como
  fazer", PDF gerado).
- `src/data/taskBank.ts` — banco estruturado de responsabilidades, consolidado a
  partir dos documentos oficiais de referência por faixa etária (3–5, 6–8, 9–11 e
  12+ anos). Adicionar uma tarefa nova é só acrescentar um item ao array.
- `src/lib/suggestionEngine.ts` — motor de sugestões (idade + autonomia + ambiente
  da família + características da família + momento do dia).
- `src/lib/pdfGenerator.ts` + `src/lib/pdfIcons.ts` — geração dos PDFs (rotina e
  cards "Como fazer") desenhando diretamente com a API do jsPDF, com um pequeno
  sistema de ícones vetoriais próprio (por palavra-chave da tarefa) já que fontes
  padrão de PDF não renderizam emoji.
- `src/store/useAppStore.ts` — estado global e todas as ações (CRUD de família,
  crianças, tarefas, rotinas, cópia de dias, rotinas especiais, cards, PDFs).
- `src/pages` — uma tela por rota do fluxo: boas-vindas, cadastro, login, família,
  perfil da criança (wizard em 4 passos), escolha de responsabilidades, montador de
  rotina, prévia, PDF gerado, tarefas da semana, rotinas especiais, cards "Como
  fazer", painel da família.

## Próximos passos naturais

- Autenticação e persistência em um backend real (hoje tudo vive no
  `localStorage` do navegador — adequado para uma primeira versão funcional, mas
  não para múltiplos dispositivos/produção).
- Upload de fotos otimizado (hoje as fotos ficam como data URL no próprio
  `localStorage`).
- Camada de IA para reorganização/adaptação de rotinas, usando os mesmos dados
  estruturados já existentes (perfil da criança, banco de tarefas, rotina atual).
