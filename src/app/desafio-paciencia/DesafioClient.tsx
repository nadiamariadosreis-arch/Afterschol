"use client";

import { useSyncExternalStore } from "react";
import { DAYS } from "./data";

const KEY = "desafio-paciencia-v1";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function toggle(day: number, done: number[]) {
  const next = done.includes(day) ? done.filter((d) => d !== day) : [...done, day];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: progress just won't persist
  }
  listeners.forEach((l) => l());
}

export function DesafioClient() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const done: number[] = JSON.parse(raw);
  const total = DAYS.length;

  return (
    <div>
      <div className="text-center">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
          Desafio de 7 dias
        </div>
        <h1 className="font-heading font-bold text-[32px] md:text-[42px] text-navy leading-[1.15]">
          Mais paciência com os filhos
        </h1>
        <p className="text-ink/60 mt-4 text-[17px] max-w-md mx-auto">
          Uma missão simples por dia. Faça uma de cada vez, marque quando
          cumprir e acompanhe a sua semana.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-[13px] text-ink/50 mb-2">
          <span>Seu progresso</span>
          <span>
            {done.length} de {total} dias
          </span>
        </div>
        <div
          className="h-2 rounded-full bg-line overflow-hidden"
          role="progressbar"
          aria-valuenow={done.length}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full bg-flame transition-all duration-300"
            style={{ width: `${(done.length / total) * 100}%` }}
          />
        </div>
        {done.length === total ? (
          <p className="mt-4 text-center text-navy font-semibold">
            Você completou os 7 dias! Que Deus abençoe a sua família.
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {DAYS.map((d) => {
          const isDone = done.includes(d.day);
          return (
            <details
              key={d.day}
              className="group rounded-xl border border-line bg-card open:bg-cream/40"
              open={d.day === 1}
            >
              <summary className="flex items-center gap-4 cursor-pointer list-none px-5 py-4">
                <span
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold ${
                    isDone ? "bg-flame text-white" : "bg-cream text-navy"
                  }`}
                >
                  {isDone ? "✓" : d.day}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] uppercase tracking-[0.2em] text-ink/50">
                    Dia {d.day}
                  </span>
                  <span className="block font-heading font-bold text-navy leading-snug">
                    {d.title}
                  </span>
                </span>
              </summary>
              <div className="px-5 pb-5 text-ink/80">
                <p className="text-[17px]">{d.mission}</p>
                <h3 className="font-heading font-bold text-navy mt-5 mb-2">
                  Como fazer
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {d.how.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <h3 className="font-heading font-bold text-navy mt-5 mb-2">
                  Uma frase para usar
                </h3>
                <p className="italic">“{d.say}”</p>
                <h3 className="font-heading font-bold text-navy mt-5 mb-2">
                  Para pensar à noite
                </h3>
                <p>{d.night}</p>
                <blockquote className="mt-5 rounded-xl bg-cream border border-line p-4 italic">
                  🙏 {d.prayer}
                </blockquote>
                <button
                  onClick={() => toggle(d.day, done)}
                  className={`mt-5 inline-flex items-center justify-center rounded-full px-6 py-2.5 font-body font-semibold text-[15px] transition-colors ${
                    isDone
                      ? "border border-navy text-navy hover:bg-navy hover:text-white"
                      : "bg-navy text-white hover:bg-ink"
                  }`}
                >
                  {isDone ? "Desmarcar dia" : "Missão cumprida"}
                </button>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
