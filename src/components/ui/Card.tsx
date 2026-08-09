import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`bg-card border border-line rounded-sm p-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
