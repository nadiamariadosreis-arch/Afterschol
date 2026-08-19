# [Nome a definir] — Plataforma de Estruturação de Instagram para Crescimento Orgânico

> Documento de especificação — v1
> Projeto isolado, independente de outras plataformas do workspace (ex: "Perfil & Plano").

## 1. O que é

Um SaaS que ajuda uma pessoa a **criar um perfil de Instagram do zero**, em qualquer nicho, e
estruturar tudo o que é necessário para crescer **no orgânico** (sem tráfego pago): nicho,
identidade, conteúdo, calendário e estratégia de engajamento.

A plataforma não posta nada por você e não se conecta à API oficial do Instagram — ela é uma
mesa de planejamento. O usuário executa no Instagram de verdade, fora da plataforma.

**Diferença em relação a "Perfil & Plano" (outro projeto do workspace):** aquele produto
analisa um perfil **que já existe** (a partir de prints) e devolve um diagnóstico. Este produto
aqui parte do **zero absoluto** — antes mesmo de o perfil existir — e cobre a jornada completa de
concepção: nicho → identidade → grid planejado → conteúdo → calendário.

## 2. Público-alvo

Pessoas que quer(em) começar um Instagram novo (pessoal, de marca ou de produto) para vender de
forma orgânica, sem verba de anúncio, e não sabem por onde começar.

## 3. Módulos do produto

### 3.1 Pesquisa de nicho
- Usuário informa uma área de interesse ou competência.
- A plataforma sugere sub-nichos com potencial, aponta o que costuma funcionar (formatos, dores
  do público, ângulos de conteúdo) e o que evitar (nichos saturados, promessas vagas).
- Saída: 1 nicho escolhido + justificativa + público-alvo descrito.

### 3.2 Identidade do perfil
- A partir do nicho escolhido, define: nome de usuário, bio, proposta de valor, tom de voz,
  paleta de cores/estética visual, pilares de conteúdo (3–4 temas recorrentes).
- Saída: um "briefing de marca pessoal" salvo no perfil do usuário.

### 3.3 Simulador visual do perfil
- Uma tela que imita o layout do Instagram (foto de perfil, bio, destaques, grid 3 colunas)
  para o usuário organizar e visualizar como o grid vai ficar **antes** de postar de verdade.
- Permite reordenar posts planejados no grid como um quebra-cabeça.

### 3.4 Gerador de conteúdo
- Com base no nicho + identidade, sugere pautas de posts/reels/stories: tema, gancho, roteiro
  ou legenda pronta, e formato sugerido (reels, carrossel, foto única).

### 3.5 Calendário editorial
- Organiza as pautas geradas em um calendário semanal/mensal, com frequência e dias sugeridos
  pensados para consistência (fator chave do orgânico).

### 3.6 Estratégia de crescimento orgânico
- Checklist e boas práticas: hashtags, horários, uso de stories para engajamento, colaborações,
  como usar comentários/DM para gerar comunidade — tudo sem tráfego pago.

## 4. Fluxo do usuário (MVP)

1. Cadastro/login.
2. Pesquisa de nicho → escolhe um nicho.
3. Define identidade do perfil (assistido por IA, editável).
4. Gera pautas de conteúdo para as próximas semanas.
5. Organiza as pautas no calendário editorial.
6. Visualiza o resultado no simulador de grid.
7. Acompanha um checklist de boas práticas de crescimento orgânico.

Tudo fica salvo na conta do usuário e pode ser revisitado/editado a qualquer momento.

## 5. Escopo do MVP (fase 1)

Priorizando o fluxo ponta a ponta funcionando antes de refinar visual:

- [ ] Autenticação (email + senha)
- [ ] Módulo de nicho (sugestão via IA)
- [ ] Módulo de identidade (briefing gerado + editável)
- [ ] Gerador de pautas de conteúdo (lista, não calendário ainda)
- [ ] Calendário editorial (arrastar pautas para dias da semana)
- [ ] Simulador de grid (visualização estática do layout planejado)
- [ ] Histórico: tudo salvo por usuário

Fora do escopo do MVP (fases futuras): cobrança/assinatura, integração real com a API do
Instagram, colaboração em equipe, exportação para agendadores de terceiros.

## 6. Stack proposta

- Frontend: React + TypeScript
- Backend/dados: a definir (Supabase é o padrão já usado em outros projetos deste workspace,
  o que facilitaria reaproveitar padrões de auth/banco)
- IA: modelo de linguagem para geração de nicho/identidade/conteúdo (via API, chamado a partir
  de uma function/serviço de backend — nunca direto do cliente, para não expor chave)

## 7. Em aberto

- Nome do produto.
- Se o simulador de grid entra na fase 1 ou fica para a fase 2 (é a parte mais trabalhosa
  visualmente).
- Se a IA de conteúdo gera legendas prontas ou apenas roteiros/temas.
