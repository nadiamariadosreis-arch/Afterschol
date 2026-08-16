export const GUIDE_MARKDOWN_PLACEHOLDER = `# Título
Subtítulo opcional

Parágrafo de introdução, texto livre.

> Aviso importante que aparece destacado.

## Primeira seção
- Primeiro ponto
- Segundo ponto

## Materiais necessários
- Item
- Item

## Passo a passo
| Etapa | O que fazer |
| --- | --- |
| 1 | ... |
| 2 | ... |

## Uma palavra final
Mensagem de encorajamento para fechar.`;

export function MarkdownHint() {
  return (
    <p className="text-ink/50 text-[13px]">
      <code># Título</code> vira o cabeçalho, a linha logo abaixo vira o
      subtítulo, <code>&gt; texto</code> vira um aviso destacado,{" "}
      <code>## Seção</code> começa uma seção nova (listas curtas viram
      etiquetas, listas longas viram lista com ícone, tabelas com{" "}
      <code>|</code> viram tabela), e a última seção sempre vira o bloco de
      encerramento.
    </p>
  );
}
