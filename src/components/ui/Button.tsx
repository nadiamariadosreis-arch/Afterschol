import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "disabled";

const variantClasses: Record<Variant, string> = {
  primary: "bg-orange text-white hover:bg-orange-dark border border-orange",
  secondary: "bg-transparent text-orange-dark border border-orange hover:bg-orange/10",
  ghost: "bg-transparent text-ink border border-line hover:border-orange",
  disabled: "bg-transparent text-ink/40 border border-line cursor-not-allowed",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-[15px] transition-colors duration-150";

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
