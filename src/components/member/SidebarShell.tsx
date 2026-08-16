"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { Logo } from "./Logo";

export function SidebarShell({
  activeChildName,
  isAdmin,
}: {
  activeChildName: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  const nav = <NavContent activeChildName={activeChildName} isAdmin={isAdmin} />;

  return (
    <>
      <header className="border-b border-line bg-parchment px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <Logo />

        <div className="hidden md:flex items-center gap-5 text-[14px] font-body">
          {activeChildName ? (
            <Link href="/perfis" className="text-ink/60 hover:text-moss">
              {activeChildName} · trocar perfil
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="text-navy hover:text-moss">
              Administração
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button type="submit" className="text-terracotta hover:underline underline-offset-4">
              Sair
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="md:hidden text-ink border border-line rounded-sm px-3 py-1.5 text-[14px] shrink-0"
        >
          Menu
        </button>
      </header>

      {open ? (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}>
          {/* Clicks anywhere in the panel bubble up and close it too — every
              item here (nav link, logout button) is a "done, dismiss" action. */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-parchment border-r border-line p-6 overflow-y-auto">
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

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-[81px] md:bottom-0 md:w-64 md:border-r md:border-line md:bg-parchment md:px-6 md:py-8 md:overflow-y-auto">
        {nav}
      </aside>
    </>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9.5 10 3l7 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5V17h10V8.5" strokeLinecap="round" strokeLinejoin="round" />
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

function NavContent({
  activeChildName,
  isAdmin,
}: {
  activeChildName: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex flex-col gap-8 flex-1 text-[15px] font-body">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-sm ${
            isActive("/dashboard") ? "bg-moss text-parchment" : "text-ink/80 hover:bg-parchment-dark"
          }`}
        >
          <HomeIcon /> Catálogo de Jogos
        </Link>
      </div>

      <div className="flex flex-col gap-1 mt-auto">
        <Link
          href="/conta"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-sm ${
            isActive("/conta") ? "bg-moss text-parchment" : "text-ink/80 hover:bg-parchment-dark"
          }`}
        >
          <UserIcon /> Minha Conta
        </Link>
        {/* Admin link, child switcher and sair live in the top header on
            desktop; repeated here so the mobile drawer is self-contained. */}
        <div className="md:hidden flex flex-col gap-1 mt-2 pt-2 border-t border-line">
          {isAdmin ? (
            <Link href="/admin" className="px-3 py-2 rounded-sm text-navy hover:bg-parchment-dark">
              Administração
            </Link>
          ) : null}
          {activeChildName ? (
            <Link
              href="/perfis"
              className="px-3 py-2 rounded-sm text-ink/50 hover:bg-parchment-dark text-[14px]"
            >
              {activeChildName} · trocar perfil
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-sm text-terracotta hover:bg-parchment-dark"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
