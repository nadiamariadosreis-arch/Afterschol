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
  const content = (
    <div
      className={`group flex flex-col rounded-2xl border border-line bg-card shadow-sm transition-all overflow-hidden ${
        bloqueado ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <ModuleCover numero={numero} titulo={titulo} />
      <div className="flex flex-col gap-3 p-5">
        <p className="text-ink/65 text-[14px]">{resumo}</p>
        <ProgressBar percent={concluido ? 100 : 0} label={concluido ? "Concluído ✓" : "Não iniciado"} />
      </div>
    </div>
  );

  if (bloqueado) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
