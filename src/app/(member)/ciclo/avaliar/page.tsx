import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";
import { PROCESSO_INFO } from "@/lib/apfa/processos";
import { PROCESSO_ORDER, emptyAvaliar } from "@/lib/apfa/types";
import { AvaliarForm } from "./AvaliarForm";

export default async function AvaliarPage() {
  const { cycle } = await requireCurrentCycle();

  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="Pilar 1"
        title="Avaliar"
        subtitle="Sentar uma vez, olhar o cenário real, sem julgamento. Aqui você entende os 4 processos e compara o cenário ideal com o que está acontecendo de fato."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {PROCESSO_ORDER.map((key) => (
          <Card key={key}>
            <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">
              {PROCESSO_INFO[key].titulo} — {PROCESSO_INFO[key].resumo}
            </h4>
            <p className="text-ink/65 text-[14px]">{PROCESSO_INFO[key].descricao}</p>
          </Card>
        ))}
      </div>

      <Callout title="Ao final deste pilar, você vai ter:">
        Os percentuais ideais ajustados pra sua família, o checklist da renda real preenchido, e um
        comparativo visual mostrando exatamente onde o dinheiro está saindo do combinado.
      </Callout>

      <AvaliarForm cycleId={cycle.id} initial={cycle.avaliar ?? emptyAvaliar()} initialPercentuais={cycle.percentuais} />
    </div>
  );
}
