"use client";

import { motion } from "framer-motion";
import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { HTMLMotionProps } from "framer-motion";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-orange text-white hover:bg-orange-dark",
    secondary: "bg-card text-ink border border-line hover:bg-cream-dark",
    ghost: "text-ink-soft hover:text-ink hover:bg-cream-dark",
  };
  return (
    <motion.button
      whileHover={{ scale: props.disabled ? 1 : 1.03 }}
      whileTap={{ scale: props.disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-orange ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-orange ${props.className ?? ""}`}
    />
  );
}

export function Card({
  hoverable = false,
  className = "",
  ...props
}: HTMLMotionProps<"div"> & { hoverable?: boolean }) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: "0 8px 20px -8px rgba(44,36,27,0.25)" } : undefined}
      transition={{ duration: 0.18 }}
      className={`rounded-xl border border-line bg-card p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-light px-2.5 py-0.5 text-xs font-medium text-orange-dark">
      {children}
    </span>
  );
}
