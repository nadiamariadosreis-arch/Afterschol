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
