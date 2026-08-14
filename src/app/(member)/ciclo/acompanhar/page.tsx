import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { emptyAcompanhar } from "@/lib/apfa/types";
import { AcompanharForm } from "./AcompanharForm";

export default async function AcompanharPage() {
  const { cycle } = await requireCurrentCycle();

  const pistas = {
    reservaSeparada: Boolean(cycle.fazer_acontecer?.reserva.guardado),
    cortesPlanejados: (cycle.planejar?.organizacao_mes ?? []).filter((i) => i.cortar).map((i) => i.nome).filter(Boolean),
    proximaReuniao: cycle.planejar?.reuniao.proxima_data ?? "",
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Pilar 4"
        title="Acompanhar"
        subtitle="Revisão contínua, com perguntas — não cobrança. O que sair daqui já alimenta o Avaliar do mês que vem."
      />
      <AcompanharForm
        cycleId={cycle.id}
        initial={cycle.acompanhar ?? emptyAcompanhar()}
        percentuaisAtuais={cycle.percentuais}
        pistas={pistas}
      />
    </div>
  );
}
