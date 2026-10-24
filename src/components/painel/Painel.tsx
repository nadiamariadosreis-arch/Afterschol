"use client";

import { useState } from "react";
import { useHydrated } from "@/lib/painel/store";
import { Capitulo } from "./Capitulo";
import { Casa } from "./Casa";
import { Habitos } from "./Habitos";
import { Hoje } from "./Hoje";
import { Instagram } from "./Instagram";
import { Regra } from "./Regra";
import { Semana } from "./Semana";

const TABS = [
  { id: "hoje", label: "Hoje", icon: "🕰️", View: Hoje },
  { id: "semana", label: "Semana", icon: "🗓️", View: Semana },
  { id: "casa", label: "Casa", icon: "🏡", View: Casa },
  { id: "instagram", label: "Instagram", icon: "📸", View: Instagram },
  { id: "habitos", label: "Hábitos", icon: "🌿", View: Habitos },
  { id: "capitulo", label: "Capítulo", icon: "📜", View: Capitulo },
  { id: "regra", label: "A Regra", icon: "✝️", View: Regra },
] as const;

export function Painel() {
  const hydrated = useHydrated();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hoje");
  const Active = TABS.find((t) => t.id === tab)!.View;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-parchment border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 pb-4">
          <div className="text-[11px] tracking-[0.28em] uppercase text-flame font-semibold">Ora et labora · em casa</div>
          <h1 className="font-display text-[28px] md:text-[34px] text-navy leading-tight">Horarium da Mãe</h1>
          <p className="text-ink/60 text-[14.5px]">Um painel para viver o dia com ordem, medida e paz, inspirado na Regra de São Bento.</p>
        </div>
        <nav className="sticky top-0 z-20 bg-parchment/95 backdrop-blur border-t border-line" aria-label="Seções do painel">
          <div className="max-w-6xl mx-auto px-3 md:px-6 flex gap-1 overflow-x-auto py-2">
            {TABS.map((t) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={on ? "page" : undefined}
                  className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${on ? "bg-navy text-white" : "text-ink/60 hover:bg-cream"}`}
                >
                  <span className="mr-1.5">{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8 pb-24">
        {hydrated ? <Active /> : <div className="h-96 rounded-3xl bg-parchment-dark/60 animate-pulse" />}
      </main>
    </div>
  );
}
