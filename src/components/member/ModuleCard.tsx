import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
      className={`group flex flex-col gap-4 rounded-2xl border border-line bg-card p-6 shadow-sm transition-all ${
        bloqueado ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center font-display-italic font-semibold text-[18px] ${
          concluido ? "bg-sage text-white" : "bg-orange-light text-orange-dark"
        }`}
      >
        {concluido ? "✓" : numero}
      </div>
      <div>
        <h3 className="font-display-italic font-semibold text-[22px] text-ink">{titulo}</h3>
        <p className="text-ink/65 text-[15px] mt-1.5">{resumo}</p>
      </div>
      <ProgressBar percent={concluido ? 100 : 0} label={concluido ? "Concluído" : "Não iniciado"} />
    </div>
  );

  if (bloqueado) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
