import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const MODEL = "claude-opus-5";

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
