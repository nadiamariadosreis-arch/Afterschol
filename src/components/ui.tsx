import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, X } from "lucide-react";

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
  onRemove,
}: {
  label: string;
  detail?: string;
  meta?: string;
  checked: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        checked ? "border-sage/40 bg-sage-light/60" : "border-ink/10 bg-white hover:border-terracotta/40"
      }`}
    >
      <label className="flex flex-1 cursor-pointer items-start gap-3">
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
      </label>
      {meta && (
        <span className="mt-0.5 shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium text-ink-soft">
          {meta}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover "${label}"`}
          className="mt-0.5 shrink-0 rounded-full p-1 text-ink-soft/60 hover:bg-terracotta-light hover:text-terracotta-dark"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function AddTaskForm({
  onAdd,
  placeholder = "Adicionar tarefa...",
  withMinutes = false,
}: {
  onAdd: (values: { label: string; minutes?: number }) => void;
  placeholder?: string;
  withMinutes?: boolean;
}) {
  const [label, setLabel] = useState("");
  const [minutos, setMinutos] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    const minutes = withMinutes && minutos ? Number(minutos) : undefined;
    onAdd({ label: trimmed, minutes: minutes && !Number.isNaN(minutes) ? minutes : undefined });
    setLabel("");
    setMinutos("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-terracotta focus:outline-none"
      />
      {withMinutes && (
        <input
          type="number"
          min={1}
          value={minutos}
          onChange={(e) => setMinutos(e.target.value)}
          placeholder="min"
          className="w-16 shrink-0 rounded-xl border border-ink/15 bg-white px-2 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-terracotta focus:outline-none"
        />
      )}
      <button
        type="submit"
        disabled={!label.trim()}
        className="flex shrink-0 items-center gap-1 rounded-xl bg-terracotta px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar</span>
      </button>
    </form>
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
