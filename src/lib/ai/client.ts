import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const MODEL = "claude-sonnet-5";

/**
 * Pede ao modelo um JSON estruturado e faz o parse.
 * O prompt deve instruir explicitamente o formato de saída esperado.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA sem conteúdo de texto");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Resposta da IA não continha JSON reconhecível");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

/**
 * Envia um PDF para o modelo e retorna um resumo em texto focado na estrutura e
 * nos ensinamentos do material (para orientar a geração de conteúdo gratuito).
 */
export async function summarizeDocument(base64Data: string, filename: string): Promise<string> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "medium" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Data },
            title: filename,
          },
          {
            type: "text",
            text: `Resuma o conteúdo deste PDF em português, focando na estrutura, nos
ensinamentos e no método demonstrado (não apenas o tema geral). Esse resumo será usado como
referência para criar conteúdo gratuito de Instagram baseado neste material pago. Escreva um
resumo direto, em 2-4 parágrafos, sem introduções como "este documento fala sobre".`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA sem conteúdo de texto");
  }

  return textBlock.text.trim();
}
