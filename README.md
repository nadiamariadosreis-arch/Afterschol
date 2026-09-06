# Afterschol — Memorização Católica Infantil

Protótipo de app para ajudar crianças a memorizar ensinamentos da Igreja
Católica (mandamentos, sacramentos, orações, pecados capitais, dons e
frutos do Espírito Santo) usando o método de memorização por repetição
progressiva inspirado em Charlotte Mason.

## O que já está funcionando

Módulo **Os Dez Mandamentos**, com os 3 primeiros mandamentos totalmente
implementados, seguindo o fluxo pedagógico:

1. **Apresentação** — o app mostra e fala (voz em pt-BR) o mandamento completo.
2. **Repetição** — a criança repete em voz alta (confirmação manual ou,
   quando o navegador suporta, reconhecimento de voz).
3. **Completar (poucas lacunas)** — faltam só as últimas palavras.
4. **Completar (mais lacunas)** — faltam mais palavras.
5. **Iniciais** — aparece só a primeira letra de cada palavra, a criança
   completa o resto (como nas cartinhas em PDF).
6. **Sozinho(a)** — a criança fala/escreve o mandamento inteiro sem ajuda.
   Se errar, volta para a etapa 1 desse mandamento. Se acertar, avança.
7. **Revisão cumulativa** (a partir do 2º mandamento) — a criança precisa
   recitar todos os mandamentos já aprendidos antes de seguir para o
   próximo.

O progresso é salvo no navegador (localStorage), então a criança pode
fechar e continuar depois de onde parou.

Os outros módulos (sacramentos, orações, pecados capitais, dons e frutos
do Espírito Santo) já aparecem na tela inicial como "em breve" — a
estrutura de dados em `js/data.js` foi pensada para receber esse conteúdo
depois, reaproveitando o mesmo motor de etapas.

## Como testar

Não precisa instalar nada. Basta abrir o arquivo `index.html` no navegador
(Chrome recomendado, pois o reconhecimento de voz funciona melhor nele),
ou rodar um servidor local simples:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Estrutura

```
index.html        # página única do app
css/style.css      # visual (cores amigáveis para criança)
js/data.js         # conteúdo (mandamentos, e módulos futuros)
js/app.js          # motor: etapas, verificação de respostas, progresso
```

## Próximos passos sugeridos

- Adicionar os mandamentos 4 a 10 e os demais módulos (basta seguir o
  mesmo formato em `js/data.js`).
- Perfil por criança (hoje o progresso é único por navegador).
- Efeitos visuais/sonoros de conquista (estrelinhas, sons de acerto).
- Se quiser um editor visual para ajustar telas com mais facilidade, dá
  para migrar este protótipo para o Lovable a partir daqui — a lógica de
  etapas já está isolada em `js/app.js`, o que facilita a portabilidade.
