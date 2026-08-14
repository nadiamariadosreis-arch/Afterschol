import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`bg-card border border-line rounded-2xl p-7 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
