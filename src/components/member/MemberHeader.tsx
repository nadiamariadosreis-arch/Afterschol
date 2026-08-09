import Link from "next/link";
import { logoutAction } from "@/app/actions";

export function MemberHeader({
  activeChildName,
  isAdmin,
}: {
  activeChildName: string | null;
  isAdmin: boolean;
}) {
  return (
    <header className="border-b border-line px-6 md:px-[8vw] py-5 flex items-center justify-between flex-wrap gap-4">
      <Link href="/dashboard" className="font-display italic font-semibold text-[22px] text-ink">
        Livros Vivos
      </Link>

      <nav className="flex items-center gap-6 text-[15px] font-body">
        <Link href="/dashboard" className="text-ink/80 hover:text-moss">
          Dashboard
        </Link>
        <Link href="/conta" className="text-ink/80 hover:text-moss">
          Minha Conta
        </Link>
        {isAdmin ? (
          <Link href="/admin" className="text-navy hover:text-moss">
            Administração
          </Link>
        ) : null}
        {activeChildName ? (
          <Link href="/perfis" className="text-ink/60 hover:text-moss">
            {activeChildName} · trocar
          </Link>
        ) : null}
        <form action={logoutAction}>
          <button type="submit" className="text-terracotta hover:underline underline-offset-4">
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
