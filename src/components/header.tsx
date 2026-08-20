import Link from "next/link";

export function Header({ title }: { title?: string }) {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="font-display text-lg font-semibold text-orange-dark">
          Estúdio de Crescimento
        </Link>
        {title && <span className="text-sm text-ink-soft">{title}</span>}
        <form action="/logout" method="post">
          <button
            type="submit"
            className="text-sm text-ink-soft hover:text-ink"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
