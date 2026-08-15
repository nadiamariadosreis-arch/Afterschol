import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Callout } from "@/components/ui/Callout";
import { Paywall } from "@/components/member/Paywall";
import { emptyPlanejar } from "@/lib/apfa/types";
import { PlanejarForm } from "./PlanejarForm";

export default async function PlanejarPage() {
  const { profile, cycle } = await requireCurrentCycle();

  if (!profile.paid) {
    return (
      <Paywall
        titulo="Planejar"
        resumo="Decidir o plano do mês, com um plano de ação real para o que dói — a parte técnica da reunião, as dívidas, a organização do mês e o cartão de crédito."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Pilar 2"
        title="Planejar"
        subtitle="Decidir o plano do mês, com um plano de ação real para o que dói — a parte técnica da reunião, as dívidas, a organização do mês e o cartão de crédito."
      />
      <Callout title="Ao final deste pilar, você vai ter:">
        A reunião marcada, a dívida que mais pesa priorizada no plano, cada conta do mês com dia e
        meio de pagamento definidos, e a fatura do cartão avaliada item por item.
      </Callout>
      <PlanejarForm cycleId={cycle.id} familyId={profile.id} initial={cycle.planejar ?? emptyPlanejar()} />
    </div>
  );
}
