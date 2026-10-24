"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`bg-card border border-line rounded-2xl p-5 md:p-6 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[11px] tracking-[0.24em] uppercase font-semibold ${className}`}>{children}</div>
  );
}

export function Heading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[24px] md:text-[28px] text-navy leading-tight">{children}</h2>
      {sub ? <p className="text-ink/60 text-[14.5px] mt-1 max-w-2xl">{sub}</p> : null}
    </div>
  );
}

export function Check({
  checked,
  onChange,
  color = "#4a5d45",
  label,
  strike = true,
  small = false,
}: {
  checked: boolean;
  onChange: () => void;
  color?: string;
  label: ReactNode;
  strike?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="group flex items-start gap-3 text-left w-full py-1.5"
    >
      <span
        className={`mt-0.5 shrink-0 grid place-items-center rounded-full border-2 transition-all ${small ? "w-5 h-5" : "w-6 h-6"}`}
        style={{ borderColor: color, background: checked ? color : "transparent" }}
      >
        <svg
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 text-white transition-transform ${checked ? "scale-100" : "scale-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        className={`text-[15px] leading-snug transition-colors ${checked ? "text-ink/40" : "text-ink"} ${checked && strike ? "line-through" : ""}`}
      >
        {label}
      </span>
    </button>
  );
}

export function Ring({
  value,
  size = 96,
  stroke = 9,
  color = "#b08d45",
  track = "rgba(255,255,255,.18)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function AddInput({
  placeholder,
  onAdd,
  buttonLabel = "Adicionar",
  className = "",
  children,
}: {
  placeholder: string;
  onAdd: (text: string) => void;
  buttonLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className={`flex flex-wrap gap-2 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text);
        setText("");
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-[140px] rounded-full border border-line bg-white px-4 py-2 text-[14.5px] outline-none focus:border-navy"
      />
      {children}
      <button
        type="submit"
        className="rounded-full bg-navy text-white px-4 py-2 text-[14px] font-semibold hover:bg-ink transition-colors"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export function XButton({ onClick, label = "Remover" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 text-ink/30 hover:text-flame text-[18px] leading-none px-1"
    >
      ×
    </button>
  );
}
