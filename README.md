# Rotina da Mamãe 🏡

Um app para mães organizarem a rotina de casa: você diz quanto tempo livre tem
agora e o nível de energia, e o app decide quais tarefas domésticas valem mais
a pena fazer nesse tempo — priorizando o que está mais atrasado e mais
importante, sem deixar de reservar espaço para autocuidado e tempo de
qualidade com as crianças.

## Como funciona

- Cada tarefa tem duração, frequência esperada (diária/semanal/quinzenal/
  mensal) e um nível de importância.
- A cada tarefa é calculada uma **urgência** (quão atrasada ela está em
  relação ao ciclo esperado) combinada com a importância.
- Dado o tempo livre informado, um algoritmo de otimização (knapsack 0/1)
  escolhe o conjunto de tarefas que maximiza a urgência/importância total sem
  ultrapassar o tempo disponível.
- Tarefas marcadas como concluídas ficam salvas (localStorage) e voltam a
  "esfriar" a urgência até o próximo ciclo.
- A lista de tarefas é totalmente editável: dá para adicionar, remover e
  ajustar duração/frequência/prioridade de acordo com a rotina de cada casa.

## Rodando localmente

```bash
npm install
npm run dev
```

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Sem backend — tudo roda no
navegador e persiste em `localStorage`.
