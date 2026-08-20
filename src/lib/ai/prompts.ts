export function nicheSuggestionsPrompt(interest: string) {
  return `Você é um estrategista de crescimento orgânico no Instagram.
Um usuário quer criar um perfil novo do zero em torno deste interesse/competência: "${interest}".

Sugira 4 sub-nichos específicos e vendáveis dentro dessa área, focados em crescimento ORGÂNICO
(sem tráfego pago). Para cada um, avalie potencial real, não genérico.

Responda APENAS com um array JSON, sem texto antes ou depois, no formato:
[
  {
    "niche": "nome curto do sub-nicho",
    "audience": "descrição do público-alvo em 1 frase",
    "rationale": "por que esse nicho tem potencial no orgânico, 1-2 frases",
    "avoid": "um erro comum ou armadilha a evitar nesse nicho, 1 frase"
  }
]`;
}

export function identityBriefPrompt(niche: string, audience: string) {
  return `Você é um estrategista de branding pessoal para Instagram.
Nicho escolhido: "${niche}". Público-alvo: "${audience}".

Monte um briefing de identidade de perfil para crescimento orgânico.

Para a bio, siga SEMPRE esta estrutura de 4 linhas (uma por linha, sem numerar):
1. Frase de impacto que resume como a pessoa ajuda e o que ela faz.
2. Uma linha que transmita autoridade (formação, experiência, resultado, credencial).
3. O que ela vende, apresentado como benefício (não como produto genérico).
4. Uma chamada curta para o link de vendas/agendamento (ex: "👉 Link na bio" ou similar).

Gere 3 variações de bio seguindo essa estrutura, com ângulos diferentes na linha 1 e 3.

Responda APENAS com um objeto JSON, sem texto antes ou depois, no formato:
{
  "username_suggestion": "sugestão de @ curto e memorável, sem espaços",
  "bio_options": ["bio 1 seguindo a estrutura de 4 linhas, até 150 caracteres", "bio 2 seguindo a mesma estrutura, ângulo diferente", "bio 3 seguindo a mesma estrutura, ângulo diferente"],
  "value_proposition": "proposta de valor em 1 frase clara",
  "tone_of_voice": "descrição do tom de voz em 1-2 frases",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "content_pillars": ["pilar 1", "pilar 2", "pilar 3", "pilar 4"]
}`;
}

export interface MethodSourceSummary {
  title: string;
  summary: string;
}

export function methodStructurePrompt(
  desiredResult: string,
  notes: string,
  sources: MethodSourceSummary[],
) {
  const sourcesBlock =
    sources.length > 0
      ? `\nResumos dos materiais pagos enviados pelo criador (cursos, apostilas etc.):\n${sources
          .map((s) => `- "${s.title}": ${s.summary}`)
          .join("\n")}\n`
      : "";

  return `Você é um estrategista de conteúdo especializado em transformar o conteúdo de um
produto pago (curso, mentoria, apostila) em conteúdo GRATUITO estratégico para Instagram.
O objetivo é ensinar de verdade um pedaço real do método — na mesma estrutura/estilo do
material pago (ex: perguntas e respostas para conteúdo de memorização, passo a passo para
conteúdo de processo, etc.) — para demonstrar competência e gerar desejo de compra do produto
completo, sem entregar o método inteiro de graça.

Resultado que o criador quer entregar através do conteúdo gratuito: "${desiredResult}"

Notas do criador sobre o método/conteúdo do produto pago:
"""
${notes || "(nenhuma nota adicional)"}
"""
${sourcesBlock}
Organize esse método em pilares (grandes blocos de conhecimento) e, dentro de cada pilar, os
processos/passos concretos que o ensinam. Depois escreva um resumo corrido que sirva como
documento de referência para gerar conteúdo no futuro.

Responda APENAS com um objeto JSON, sem texto antes ou depois, no formato:
{
  "pillars": [
    {
      "name": "nome curto do pilar",
      "description": "o que esse pilar ensina e por que importa, 1-2 frases",
      "processes": ["processo ou passo 1", "processo ou passo 2", "processo ou passo 3"]
    }
  ],
  "summary": "resumo corrido do método completo (resultado + pilares + processos, no estilo do material original), em 3-5 parágrafos"
}`;
}

export function contentPiecesPrompt(
  niche: string,
  pillars: string[],
  count: number,
  method?: {
    desiredResult: string;
    summary: string;
    pillars: { name: string; description: string; processes: string[] }[];
  } | null,
) {
  const methodBlock = method
    ? `
Você também tem acesso ao "Método" do criador: a estrutura real do produto pago dele, extraída
para orientar o conteúdo gratuito. Use isso para criar pautas que ENSINEM de verdade um pedaço
real do método — no mesmo estilo do material pago (ex: perguntas e respostas, passo a passo) —
mostrando competência e gerando desejo pelo produto completo, mas SEM entregar o método
inteiro de graça. Sempre que fizer sentido, termine a pauta com uma chamada sutil para o
produto pago.

Resultado que o método entrega: "${method.desiredResult}"
Resumo do método: """${method.summary}"""
Pilares e processos do método:
${method.pillars.map((p) => `- ${p.name}: ${p.description} (processos: ${p.processes.join(" > ")})`).join("\n")}
`
    : "";

  return `Você é um produtor de conteúdo para Instagram focado em crescimento orgânico.
Nicho: "${niche}". Pilares de conteúdo: ${pillars.join(", ")}.
${methodBlock}
Gere ${count} pautas de conteúdo variadas entre os formatos reels, carrossel, foto_unica e
stories, cobrindo os pilares acima${method ? " e o método quando fizer sentido" : ""}. Responda
APENAS com um array JSON, sem texto antes ou depois, no formato:
[
  {
    "format": "reels" | "carrossel" | "foto_unica" | "stories",
    "theme": "tema curto da pauta",
    "hook": "gancho/abertura para prender atenção nos primeiros segundos",
    "script": "roteiro ou estrutura do conteúdo em poucas linhas",
    "caption": "legenda pronta para copiar e colar, com call-to-action orgânico"
  }
]`;
}
