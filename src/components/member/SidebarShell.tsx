"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions";

type SidebarTrack = { slug: string; name: string; accessible: boolean };

export function SidebarShell({
  tracks,
  activeChildName,
  isAdmin,
}: {
  tracks: SidebarTrack[];
  activeChildName: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  const nav = <NavContent tracks={tracks} activeChildName={activeChildName} isAdmin={isAdmin} />;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-line">
        <Link href="/dashboard" className="font-display italic font-semibold text-[20px] text-ink">
          Livros Vivos
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="text-ink border border-line rounded-sm px-3 py-1.5 text-[14px]"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}>
          {/* Clicks anywhere in the panel bubble up and close it too — every
              item here (nav link, logout button) is a "done, dismiss" action. */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-parchment border-r border-line p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display italic font-semibold text-[20px] text-ink">
                Livros Vivos
              </span>
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
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:border-line md:bg-parchment md:px-6 md:py-8 md:overflow-y-auto">
        <Link
          href="/dashboard"
          className="font-display italic font-semibold text-[22px] text-ink mb-10"
        >
          Livros Vivos
        </Link>
        {nav}
      </aside>
    </>
  );
}

function NavContent({
  tracks,
  activeChildName,
  isAdmin,
}: {
  tracks: SidebarTrack[];
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
          className={`px-3 py-2 rounded-sm ${
            isActive("/dashboard") ? "bg-moss text-parchment" : "text-ink/80 hover:bg-parchment-dark"
          }`}
        >
          Início
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <div className="px-3 text-[12px] tracking-[0.2em] uppercase text-moss mb-1">Trilhas</div>
        {tracks.map((track) =>
          track.accessible ? (
            <Link
              key={track.slug}
              href={`/trilhas/${track.slug}`}
              className={`px-3 py-2 rounded-sm ${
                isActive(`/trilhas/${track.slug}`)
                  ? "bg-moss text-parchment"
                  : "text-ink/80 hover:bg-parchment-dark"
              }`}
            >
              {track.name}
            </Link>
          ) : (
            <span
              key={track.slug}
              className="px-3 py-2 rounded-sm text-ink/35 flex items-center justify-between"
            >
              {track.name}
              <span className="text-[12px] border border-line rounded-full px-2 py-0.5">
                bloqueada
              </span>
            </span>
          ),
        )}
      </div>

      <div className="flex flex-col gap-1 mt-auto">
        <Link
          href="/conta"
          className={`px-3 py-2 rounded-sm ${
            isActive("/conta") ? "bg-moss text-parchment" : "text-ink/80 hover:bg-parchment-dark"
          }`}
        >
          Minha Conta
        </Link>
        {isAdmin ? (
          <Link href="/admin" className="px-3 py-2 rounded-sm text-navy hover:bg-parchment-dark">
            Administração
          </Link>
        ) : null}
        {activeChildName ? (
          <Link href="/perfis" className="px-3 py-2 rounded-sm text-ink/50 hover:bg-parchment-dark text-[14px]">
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
    </nav>
  );
}
