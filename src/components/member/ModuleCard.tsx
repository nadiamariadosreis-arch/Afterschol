import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ModuleCover } from "./ModuleCover";

export function ModuleCard({
  href,
  numero,
  titulo,
  resumo,
  concluido,
  bloqueado,
}: {
  href: string;
  numero: number;
  titulo: string;
  resumo: string;
  concluido: boolean;
  bloqueado?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className="flex flex-col rounded-2xl border border-line bg-card shadow-sm transition-all overflow-hidden group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="relative">
          <ModuleCover numero={numero} titulo={titulo} />
          {bloqueado ? (
            <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink/60 backdrop-blur-sm text-white flex items-center justify-center text-[15px]">
              🔒
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <p className="text-ink/65 text-[14px]">{resumo}</p>
          {bloqueado ? (
            <p className="text-[13px] text-ink/45 font-semibold">🔒 Disponível após a compra</p>
          ) : (
            <ProgressBar percent={concluido ? 100 : 0} label={concluido ? "Concluído ✓" : "Não iniciado"} />
          )}
        </div>
      </div>
    </Link>
  );
}
