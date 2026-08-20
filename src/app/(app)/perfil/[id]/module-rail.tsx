"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STEP_LABELS, STEP_ORDER, STEP_ROUTE } from "@/lib/steps";
import type { ProfileStatus } from "@/lib/types";

const ICONS: Record<ProfileStatus, React.ReactNode> = {
  nicho: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  identidade: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round" />
    </svg>
  ),
  conteudo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 9.5h16M9 5v4.5" strokeLinecap="round" />
    </svg>
  ),
  calendario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" strokeLinecap="round" />
    </svg>
  ),
  ativo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  ),
};

const DESCRIPTIONS: Record<ProfileStatus, string> = {
  nicho: "Escolha o foco do perfil",
  identidade: "Marca, bio e cores",
  conteudo: "Pautas geradas por IA",
  calendario: "Organize por data",
  ativo: "Veja o resultado",
};

export function ModuleRail({ id, currentStatus }: { id: string; currentStatus: ProfileStatus }) {
  const pathname = usePathname();
  const currentIndex = STEP_ORDER.indexOf(currentStatus);

  return (
    <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-4 pt-4 md:px-8">
      {STEP_ORDER.map((step, index) => {
        const unlocked = index <= currentIndex;
        const href = `/perfil/${id}/${STEP_ROUTE[step]}`;
        const active = pathname === href;

        const tile = (
          <motion.div
            whileHover={unlocked ? { y: -3 } : undefined}
            transition={{ duration: 0.15 }}
            className={`flex w-40 shrink-0 snap-start flex-col gap-2 rounded-xl border p-4 ${
              active
                ? "border-orange bg-orange text-white"
                : unlocked
                  ? "border-line bg-card text-ink"
                  : "border-line bg-cream-dark text-ink-soft/60"
            }`}
          >
            {ICONS[step]}
            <div>
              <p className="text-xs font-medium opacity-70">{index + 1}</p>
              <p className="font-display text-sm font-semibold">{STEP_LABELS[step]}</p>
              <p className={`mt-0.5 text-xs ${active ? "text-white/80" : "text-ink-soft"}`}>
                {DESCRIPTIONS[step]}
              </p>
            </div>
          </motion.div>
        );

        return unlocked ? (
          <Link key={step} href={href}>
            {tile}
          </Link>
        ) : (
          <div key={step} className="pointer-events-none">
            {tile}
          </div>
        );
      })}
    </div>
  );
}
