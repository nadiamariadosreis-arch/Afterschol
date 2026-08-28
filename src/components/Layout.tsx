import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  ListChecks,
  Timer,
  LayoutGrid,
  RotateCcw,
  Shirt,
  Baby,
  Sun,
  CalendarDays,
  BookOpen,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Hoje", icon: Home, end: true },
  { to: "/minimo", label: "Mínimo viável", icon: ListChecks },
  { to: "/tempo", label: "Rotina por tempo", icon: Timer },
  { to: "/semanal", label: "Sistema semanal", icon: LayoutGrid },
  { to: "/reset", label: "Reset da casa", icon: RotateCcw },
  { to: "/pontos", label: "Roupa, cozinha e brinquedos", icon: Shirt },
  { to: "/criancas", label: "Crianças que ajudam", icon: Baby },
  { to: "/rotina-diaria", label: "Rotina diária", icon: Sun },
  { to: "/plano-21", label: "Plano de 21 dias", icon: CalendarDays },
  { to: "/metodo", label: "Sobre o método", icon: BookOpen },
];

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl md:gap-6 md:px-6 md:py-6">
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-6 rounded-2xl border border-ink/10 bg-white/70 p-4">
          <Brand />
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="border-b border-ink/10 bg-cream/90 px-4 py-3 backdrop-blur md:hidden">
          <Brand compact />
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-0 md:py-0 md:pb-0">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/10 bg-white/95 backdrop-blur md:hidden">
          <div className="flex overflow-x-auto">
            {NAV.map((item) => (
              <MobileNavItem key={item.to} {...item} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terracotta font-serif text-lg text-cream">
        C
      </span>
      <div>
        <p className="font-serif text-lg leading-tight text-ink">Casa em Ordem</p>
        {!compact && <p className="text-xs text-ink-soft">Acompanhamento do método</p>}
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-terracotta-light text-terracotta-dark" : "text-ink-soft hover:bg-cream-dark"
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function MobileNavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-w-[76px] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium ${
          isActive ? "text-terracotta-dark" : "text-ink-soft"
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span className="text-center leading-tight">{label}</span>
    </NavLink>
  );
}
