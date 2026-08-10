import { parseGuideMarkdown, type GuideSection } from "@/lib/guide-markdown";

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M10 2c.6 2.8 1.6 3.8 4.4 4.4-2.8.6-3.8 1.6-4.4 4.4-.6-2.8-1.6-3.8-4.4-4.4C8.4 5.8 9.4 4.8 10 2Z" />
      <path d="M16 12c.3 1.4.8 1.9 2.2 2.2-1.4.3-1.9.8-2.2 2.2-.3-1.4-.8-1.9-2.2-2.2 1.4-.3 1.9-.8 2.2-2.2Z" />
    </svg>
  );
}

/**
 * Renders the "Guia dos Pais" free-text field (Markdown, parsed by
 * `parseGuideMarkdown`) as a series of distinct visual sections: hero
 * header, plain intro, an amber notice callout, icon-bulleted or
 * chip-tag sections, a responsive table, and a closing quote card.
 */
export function GuideContent({ markdown }: { markdown: string }) {
  const guide = parseGuideMarkdown(markdown);

  return (
    <div className="flex flex-col gap-8">
      {guide.title ? (
        <div
          className="rounded-[18px] p-8 md:p-10"
          style={{
            background: [
              "radial-gradient(circle at 85% 15%, #d9e6cf, transparent 55%)",
              "linear-gradient(120deg, #f4f7f0, #e9f0e2)",
            ].join(", "),
          }}
        >
          <h1 className="font-display italic font-semibold text-[28px] md:text-[34px] text-ink leading-tight">
            {guide.title}
          </h1>
          {guide.subtitle ? (
            <p className="text-moss-dark text-[15px] mt-2">{guide.subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {guide.intro.length > 0 ? (
        <div className="flex flex-col gap-3">
          {guide.intro.map((paragraph, i) => (
            <p key={i} className="text-ink/80 text-[16px] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {guide.notice ? (
        <div className="rounded-[18px] border border-gold/40 bg-gold/10 px-6 py-5 flex gap-3 items-start">
          <Sparkle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <p className="text-ink/80 text-[15px] leading-relaxed">{guide.notice}</p>
        </div>
      ) : null}

      {guide.sections.map((section, i) => (
        <SectionBlock key={i} section={section} />
      ))}

      {guide.closing ? (
        <div className="rounded-[18px] border-l-4 border-gold bg-card shadow-sm px-6 py-7">
          {guide.closing.heading ? (
            <div className="text-[12px] tracking-[0.18em] uppercase text-moss mb-3">
              {guide.closing.heading}
            </div>
          ) : null}
          {guide.closing.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="font-display italic text-[19px] md:text-[21px] text-ink leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionBlock({ section }: { section: GuideSection }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkle className="w-4 h-4 text-gold shrink-0" />
        <h3 className="font-heading font-semibold text-[19px] text-ink">{section.heading}</h3>
      </div>

      {section.kind === "bullets" && section.style === "chips" ? (
        <div className="flex flex-wrap gap-2">
          {section.items.map((item, i) => (
            <span
              key={i}
              className="bg-moss/10 border border-moss/30 text-moss-dark text-[14px] rounded-full px-4 py-1.5"
            >
              {item}
            </span>
          ))}
        </div>
      ) : section.kind === "bullets" ? (
        <ul className="flex flex-col gap-3">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <Sparkle className="w-3.5 h-3.5 text-moss shrink-0 mt-1.5" />
              <span className="text-ink/80 text-[15px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : section.kind === "table" ? (
        <GuideTable section={section} />
      ) : (
        <div className="flex flex-col gap-3">
          {section.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-ink/80 text-[15px] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideTable({ section }: { section: Extract<GuideSection, { kind: "table" }> }) {
  return (
    <div>
      <div className="hidden md:block rounded-[18px] overflow-hidden shadow-sm border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-moss">
              {section.columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-5 py-3 text-[13px] tracking-[0.1em] uppercase font-semibold text-parchment"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-parchment-dark/50"}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-5 py-4 text-[14px] text-ink/80 align-top leading-relaxed ${
                      j === 0 ? "font-semibold text-ink whitespace-nowrap" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {section.rows.map((row, i) => (
          <div key={i} className="rounded-[14px] overflow-hidden shadow-sm border border-line">
            <div className="bg-moss text-parchment px-4 py-2 text-[14px] font-semibold">
              {row[0]}
            </div>
            <div className="px-4 py-3 flex flex-col gap-1 bg-card">
              {row.slice(1).map((cell, j) => (
                <p key={j} className="text-ink/80 text-[14px] leading-relaxed">
                  {cell}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
