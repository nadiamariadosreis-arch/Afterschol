export type GuideSection =
  | { kind: "bullets"; heading: string; items: string[]; style: "list" | "chips" }
  | { kind: "table"; heading: string; columns: string[]; rows: string[][] }
  | { kind: "text"; heading: string; paragraphs: string[] };

export type ParsedGuide = {
  title: string | null;
  subtitle: string | null;
  intro: string[];
  notice: string | null;
  sections: GuideSection[];
  closing: { heading: string | null; paragraphs: string[] } | null;
};

const CHIP_MAX_LENGTH = 50;

/**
 * Parses the specific Markdown subset the "Guia dos Pais" admin field
 * uses: a title, an optional subtitle line, intro paragraphs, an
 * optional `>` blockquote (rendered as a highlighted notice), then a
 * sequence of `## ` sections (bullet lists — rendered as tag chips
 * when every item is short, otherwise an icon list — and pipe tables).
 * The last `## ` section is always treated as the closing/encouragement
 * block, regardless of its content shape.
 */
export function parseGuideMarkdown(markdown: string): ParsedGuide {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  let title: string | null = null;
  if (lines[i]?.trim().startsWith("# ")) {
    title = lines[i].trim().slice(2).trim();
    i++;
  }

  let subtitle: string | null = null;
  if (lines[i] !== undefined && lines[i].trim() !== "" && !/^(#|>|-|\*|\|)/.test(lines[i].trim())) {
    subtitle = lines[i].trim();
    i++;
  }

  const intro: string[] = [];
  let notice: string | null = null;

  while (i < lines.length && !lines[i].trim().startsWith("## ")) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.trim().startsWith(">")) {
      const quoteParts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteParts.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      notice = quoteParts.join(" ").trim();
      continue;
    }
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("## ") && !lines[i].trim().startsWith(">")) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) intro.push(paraLines.join(" ").trim());
  }

  const rawSections: { heading: string; bodyLines: string[] }[] = [];
  while (i < lines.length) {
    if (lines[i].trim().startsWith("## ")) {
      const heading = lines[i].trim().slice(3).trim();
      i++;
      const bodyLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("## ")) {
        bodyLines.push(lines[i]);
        i++;
      }
      rawSections.push({ heading, bodyLines });
    } else {
      i++;
    }
  }

  const parsed = rawSections.map(({ heading, bodyLines }) => parseSectionBody(heading, bodyLines));

  let closing: ParsedGuide["closing"] = null;
  let sections = parsed;
  if (parsed.length > 0) {
    const last = parsed[parsed.length - 1];
    closing = { heading: last.heading, paragraphs: toParagraphs(rawSections[rawSections.length - 1].bodyLines) };
    sections = parsed.slice(0, -1);
  }

  return { title, subtitle, intro, notice, sections, closing };
}

function parseSectionBody(heading: string, bodyLines: string[]): GuideSection {
  const trimmed = bodyLines.filter((l) => l.trim() !== "");

  const hasTable = trimmed.some((l) => l.trim().startsWith("|"));
  if (hasTable) {
    const tableLines = trimmed.filter((l) => l.trim().startsWith("|"));
    const cells = (line: string) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());

    const columns = cells(tableLines[0]);
    const dataLines = tableLines.slice(1).filter((l) => !/^[\s|:-]+$/.test(l));
    const rows = dataLines.map(cells);
    return { kind: "table", heading, columns, rows };
  }

  const bulletLines = trimmed.filter((l) => /^[-*]\s+/.test(l.trim()));
  if (bulletLines.length >= trimmed.length * 0.6 && bulletLines.length > 0) {
    const items = bulletLines.map((l) => l.trim().replace(/^[-*]\s+/, "").trim());
    const allShort = items.every(
      (item) => item.length <= CHIP_MAX_LENGTH && !/[.!?]$/.test(item),
    );
    return { kind: "bullets", heading, items, style: allShort ? "chips" : "list" };
  }

  return { kind: "text", heading, paragraphs: toParagraphs(bodyLines) };
}

function toParagraphs(bodyLines: string[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const raw of bodyLines) {
    const line = raw.trim().replace(/^>\s?/, "");
    if (line === "") {
      if (current.length) paragraphs.push(current.join(" ").trim());
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) paragraphs.push(current.join(" ").trim());

  return paragraphs;
}
