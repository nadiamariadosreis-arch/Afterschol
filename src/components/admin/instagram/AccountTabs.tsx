"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "matriz", label: "Matriz 6×5" },
  { slug: "calendario", label: "Calendário" },
  { slug: "producao", label: "Produção" },
  { slug: "resultados", label: "Resultados" },
];

export function AccountTabs({ accountId }: { accountId: string }) {
  const pathname = usePathname();
  const base = `/admin/instagram/${accountId}`;

  return (
    <nav className="flex gap-1 border-b border-line mb-8 overflow-x-auto">
      {TABS.map((tab) => {
        const href = `${base}/${tab.slug}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`px-4 py-2.5 text-[15px] whitespace-nowrap border-b-2 -mb-px ${
              active
                ? "border-moss text-moss-dark font-semibold"
                : "border-transparent text-ink/60 hover:text-moss"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
