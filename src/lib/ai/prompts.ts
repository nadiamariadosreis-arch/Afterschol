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

Monte um briefing de identidade de perfil para crescimento orgânico. Responda APENAS com um
objeto JSON, sem texto antes ou depois, no formato:
{
  "username_suggestion": "sugestão de @ curto e memorável, sem espaços",
  "bio": "bio pronta para colar no Instagram, até 150 caracteres",
  "value_proposition": "proposta de valor em 1 frase clara",
  "tone_of_voice": "descrição do tom de voz em 1-2 frases",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "content_pillars": ["pilar 1", "pilar 2", "pilar 3", "pilar 4"]
}`;
}

export function contentPiecesPrompt(
  niche: string,
  pillars: string[],
  count: number,
) {
  return `Você é um produtor de conteúdo para Instagram focado em crescimento orgânico.
Nicho: "${niche}". Pilares de conteúdo: ${pillars.join(", ")}.

Gere ${count} pautas de conteúdo variadas entre os formatos reels, carrossel, foto_unica e
stories, cobrindo os pilares acima. Responda APENAS com um array JSON, sem texto antes ou
depois, no formato:
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
