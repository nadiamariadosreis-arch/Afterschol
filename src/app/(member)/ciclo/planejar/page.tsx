import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { emptyPlanejar } from "@/lib/apfa/types";
import { PlanejarForm } from "./PlanejarForm";

export default async function PlanejarPage() {
  const { profile, cycle } = await requireCurrentCycle();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Pilar 2"
        title="Planejar"
        subtitle="Decidir o plano do mês, com um plano de ação real para o que dói — a parte técnica da reunião, as dívidas, a organização do mês e o cartão de crédito."
      />
      <PlanejarForm cycleId={cycle.id} familyId={profile.id} initial={cycle.planejar ?? emptyPlanejar()} />
    </div>
  );
}
