"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { Logo } from "./Logo";

const PILARES = [
  { href: "/ciclo/avaliar", label: "1. Avaliar" },
  { href: "/ciclo/planejar", label: "2. Planejar" },
  { href: "/ciclo/fazer-acontecer", label: "3. Fazer Acontecer" },
  { href: "/ciclo/acompanhar", label: "4. Acompanhar" },
];

export function SidebarShell() {
  const [open, setOpen] = useState(false);
  const nav = <NavContent />;

  return (
    <>
      <header className="border-b border-line bg-cream px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <Logo />
        <div className="hidden md:flex items-center gap-5 text-[14px] font-body">
          <form action={logoutAction}>
            <button type="submit" className="text-orange-dark hover:underline underline-offset-4">
              Sair
            </button>
          </form>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="md:hidden text-ink border border-line rounded-full px-3 py-1.5 text-[14px] shrink-0"
        >
          Menu
        </button>
      </header>

      {open ? (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream border-r border-line p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Logo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-ink/60 text-[20px] leading-none"
              >
                ×
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-[81px] md:bottom-0 md:w-64 md:border-r md:border-line md:bg-cream md:px-6 md:py-8 md:overflow-y-auto">
        {nav}
      </aside>
    </>
  );
}

function NavContent() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex flex-col gap-8 flex-1 text-[15px] font-body">
      <div className="flex flex-col gap-1">
        <span className="px-3 text-[12px] uppercase tracking-[0.18em] text-ink/40 font-semibold mb-1">
          Ciclo do mês
        </span>
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
            pathname === "/dashboard" ? "bg-orange text-white" : "text-ink/80 hover:bg-cream-dark"
          }`}
        >
          Seu primeiro passo
        </Link>
        {PILARES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
              isActive(p.href) ? "bg-orange text-white" : "text-ink/80 hover:bg-cream-dark"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-1 mt-auto">
        <Link
          href="/historico"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
            isActive("/historico") ? "bg-orange text-white" : "text-ink/80 hover:bg-cream-dark"
          }`}
        >
          Histórico
        </Link>
        <Link
          href="/conta"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
            isActive("/conta") ? "bg-orange text-white" : "text-ink/80 hover:bg-cream-dark"
          }`}
        >
          Minha Conta
        </Link>
        <div className="md:hidden flex flex-col gap-1 mt-2 pt-2 border-t border-line">
          <form action={logoutAction}>
            <button type="submit" className="w-full text-left px-3 py-2 rounded-full text-orange-dark hover:bg-cream-dark">
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
