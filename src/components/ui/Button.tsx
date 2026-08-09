import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "disabled";

const variantClasses: Record<Variant, string> = {
  primary: "bg-moss text-parchment hover:bg-moss-dark border border-moss",
  secondary: "bg-transparent text-moss-dark border border-gold hover:bg-gold/10",
  ghost: "bg-transparent text-ink border border-line hover:border-moss",
  disabled: "bg-transparent text-ink/40 border border-line cursor-not-allowed",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-body text-[15px] tracking-wide transition-colors duration-150";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
