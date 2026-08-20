"use client";

import { AnimatePresence, motion } from "framer-motion";
import { titleForLevel } from "@/lib/gamification";

export function LevelUpModal({ level, onClose }: { level: number | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {level && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-card p-8 text-center shadow-lg"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-ink-soft hover:text-ink"
              aria-label="Fechar"
            >
              ✕
            </button>

            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-light text-orange-dark"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8">
                <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 4 4 4M17 6h3a1 1 0 0 1 1 1c0 2-1.5 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <p className="font-display mt-4 text-xl font-semibold text-ink">Subiu de nível!</p>
            <p className="mt-1 text-sm text-ink-soft">Você chegou ao nível {level}</p>
            <p className="font-display mt-3 text-2xl font-semibold text-orange-dark">
              {titleForLevel(level)}
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-dark"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
