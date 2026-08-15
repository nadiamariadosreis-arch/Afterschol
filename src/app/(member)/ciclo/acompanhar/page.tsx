import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Callout } from "@/components/ui/Callout";
import { Paywall } from "@/components/member/Paywall";
import { temAcessoPago } from "@/lib/auth";
import { emptyAcompanhar } from "@/lib/apfa/types";
import { AcompanharForm } from "./AcompanharForm";

export default async function AcompanharPage() {
  const { profile, cycle } = await requireCurrentCycle();

  if (!temAcessoPago(profile)) {
    return (
      <Paywall
        titulo="Acompanhar"
        resumo="Revisão contínua, com perguntas — não cobrança. O que sair daqui já alimenta o Avaliar do mês que vem."
      />
    );
  }

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
      <Callout title="Ao final deste pilar, você vai ter:">
        O diagnóstico do mês por processo, os percentuais recalibrados onde a meta não coube na
        vida real, e o ciclo deste mês fechado — pronto pro planner no Histórico.
      </Callout>
      <AcompanharForm
        cycleId={cycle.id}
        initial={cycle.acompanhar ?? emptyAcompanhar()}
        percentuaisAtuais={cycle.percentuais}
        pistas={pistas}
      />
    </div>
  );
}
