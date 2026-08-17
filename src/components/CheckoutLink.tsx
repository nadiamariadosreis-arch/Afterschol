"use client";

import type { ReactNode } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Link pro checkout da Kiwify que também avisa o Meta Pixel do clique, pra campanha conseguir otimizar por quem chegou perto de comprar. */
export function CheckoutLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => window.fbq?.("track", "InitiateCheckout")}
      className={className}
    >
      {children}
    </a>
  );
}
