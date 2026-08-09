import Link from "next/link";
import { logoutAction } from "@/app/actions";

export function AdminHeader() {
  return (
    <header className="border-b border-line px-6 md:px-[8vw] py-5 flex items-center justify-between flex-wrap gap-4">
      <Link href="/admin" className="font-display italic font-semibold text-[22px] text-ink">
        Administração
      </Link>

      <nav className="flex items-center gap-6 text-[15px] font-body">
        <Link href="/admin/virtudes" className="text-ink/80 hover:text-moss">
          Virtudes
        </Link>
        <Link href="/admin/trilhas" className="text-ink/80 hover:text-moss">
          Trilhas e Semanas
        </Link>
        <Link href="/admin/produtos" className="text-ink/80 hover:text-moss">
          Produtos e Acessos
        </Link>
        <Link href="/admin/familias" className="text-ink/80 hover:text-moss">
          Famílias
        </Link>
        <Link href="/dashboard" className="text-navy hover:text-moss">
          Ver como família
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-terracotta hover:underline underline-offset-4">
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
