import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta">
      {children}
    </p>
  );
}

export function PageTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="mt-1 font-serif text-3xl text-ink">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-ink-soft">{subtitle}</p>}
    </header>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-terracotta transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">
        {value} de {total} concluídas
      </p>
    </div>
  );
}

export function TaskRow({
  label,
  detail,
  meta,
  checked,
  onToggle,
}: {
  label: string;
  detail?: string;
  meta?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        checked ? "border-sage/40 bg-sage-light/60" : "border-ink/10 bg-white hover:border-terracotta/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-ink/30"
      />
      <span className="flex-1">
        <span className={`block font-medium ${checked ? "text-ink-soft line-through" : "text-ink"}`}>
          {label}
        </span>
        {detail && <span className="mt-0.5 block text-sm text-ink-soft">{detail}</span>}
      </span>
      {meta && (
        <span className="shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium text-ink-soft">
          {meta}
        </span>
      )}
    </label>
  );
}

export function Pill({ children, tone = "terracotta" }: { children: ReactNode; tone?: "terracotta" | "sage" | "butter" }) {
  const tones = {
    terracotta: "bg-terracotta-light text-terracotta-dark",
    sage: "bg-sage-light text-sage-dark",
    butter: "bg-butter-light text-[#8a6414]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
