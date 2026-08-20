"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STEP_LABELS, STEP_ORDER, STEP_ROUTE } from "@/lib/steps";
import type { ProfileStatus } from "@/lib/types";

export function StepNav({ id, currentStatus }: { id: string; currentStatus: ProfileStatus }) {
  const pathname = usePathname();
  const currentIndex = STEP_ORDER.indexOf(currentStatus);

  return (
    <nav className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4">
        {STEP_ORDER.map((step, index) => {
          const unlocked = index <= currentIndex;
          const label = STEP_LABELS[step];
          const href = `/perfil/${id}/${STEP_ROUTE[step]}`;
          const active = pathname === href;

          const content = (
            <span className="relative inline-block whitespace-nowrap px-3 py-3 text-sm">
              {index + 1}. {label}
              {active && (
                <motion.span
                  layoutId="step-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-orange"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </span>
          );

          return unlocked ? (
            <Link
              key={step}
              href={href}
              className={active ? "text-ink" : "text-ink-soft hover:text-ink"}
            >
              {content}
            </Link>
          ) : (
            <span key={step} className="pointer-events-none text-ink-soft/60">
              {content}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
