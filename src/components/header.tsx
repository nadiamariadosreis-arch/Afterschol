import Link from "next/link";

export function Header({ title }: { title?: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="font-semibold">
          Estúdio de Crescimento
        </Link>
        {title && <span className="text-sm text-neutral-500">{title}</span>}
        <form action="/logout" method="post">
          <button
            type="submit"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
