"use client";

import { motion } from "framer-motion";
import { titleForLevel } from "@/lib/gamification";

export function XpBadge({
  level,
  xpIntoLevel,
  xpForNextLevel,
  streakDays,
}: {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  streakDays: number;
}) {
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange text-xs font-semibold text-white">
          {level}
        </span>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-ink">{titleForLevel(level)}</p>
          <div className="mt-0.5 h-1.5 w-24 overflow-hidden rounded-full bg-cream-dark">
            <motion.div
              className="h-full rounded-full bg-orange"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      {streakDays > 0 && (
        <span className="flex items-center gap-1 text-xs font-medium text-orange-dark">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 1.5c.7 2 .3 3.2-.6 4.4-.9 1.2-2 2.2-2 4a3.6 3.6 0 0 0 7.2 0c0-1-.3-1.8-.8-2.5.9.5 1.7 1.5 1.7 3a4.5 4.5 0 0 1-9 0c0-3.6 2.6-5 3.5-8.9Z" />
          </svg>
          {streakDays}
        </span>
      )}
    </div>
  );
}
