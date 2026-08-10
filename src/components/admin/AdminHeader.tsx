import Link from "next/link";
import { logoutAction } from "@/app/actions";

export function AdminHeader() {
  return (
    <header className="border-b border-line px-6 md:px-[8vw] py-5 flex items-center justify-between flex-wrap gap-4">
      <Link href="/admin" className="font-display font-bold text-[22px] text-ink">
        Administração
      </Link>

      <nav className="flex items-center gap-6 text-[15px] font-body">
        <Link href="/admin/tags" className="text-ink/80 hover:text-coral">
          Tags
        </Link>
        <Link href="/admin/jogos" className="text-ink/80 hover:text-coral">
          Jogos
        </Link>
        <Link href="/admin/membros" className="text-ink/80 hover:text-coral">
          Membros
        </Link>
        <Link href="/dashboard" className="text-teal-dark hover:text-coral">
          Ver como membro
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-coral-dark hover:underline underline-offset-4">
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
