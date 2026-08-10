"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { Logo } from "./Logo";

export function SidebarShell({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  const nav = <NavContent isAdmin={isAdmin} />;

  return (
    <>
      <header className="border-b border-line bg-cream px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <Logo />

        <div className="hidden md:flex items-center gap-5 text-[14px] font-body">
          {isAdmin ? (
            <Link href="/admin" className="text-teal-dark hover:text-coral font-semibold">
              Administração
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button type="submit" className="text-coral-dark hover:underline underline-offset-4">
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-4-4" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="6.5" r="3.2" />
      <path d="M3.5 17c1.2-3.8 4-5.5 6.5-5.5s5.3 1.7 6.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function NavContent({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex flex-col gap-8 flex-1 text-[15px] font-body">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
            isActive("/dashboard") ? "bg-coral text-white" : "text-ink/80 hover:bg-cream-dark"
          }`}
        >
          <SearchIcon /> Buscar Jogos
        </Link>
      </div>

      <div className="flex flex-col gap-1 mt-auto">
        <Link
          href="/conta"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-semibold ${
            isActive("/conta") ? "bg-coral text-white" : "text-ink/80 hover:bg-cream-dark"
          }`}
        >
          <UserIcon /> Minha Conta
        </Link>
        <div className="md:hidden flex flex-col gap-1 mt-2 pt-2 border-t border-line">
          {isAdmin ? (
            <Link href="/admin" className="px-3 py-2 rounded-full text-teal-dark font-semibold hover:bg-cream-dark">
              Administração
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-full text-coral-dark hover:bg-cream-dark"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
