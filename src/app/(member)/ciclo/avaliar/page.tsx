import { requireCurrentCycle } from "@/lib/apfa/session";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";
import { PROCESSO_INFO } from "@/lib/apfa/processos";
import { cycleLabel } from "@/lib/apfa/calc";
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

      <Callout title="Como funciona este pilar">
        Primeiro você vê o cenário ideal (o quanto deveria ir pra cada processo). Depois preenche
        cada campo com o que <strong className="text-ink">você paga hoje de verdade</strong> — não é
        o ideal, é a sua realidade. A plataforma cruza os dois números sozinha e te entrega um
        diagnóstico: onde está dentro do combinado, onde está sobrando espaço, e onde está saindo
        mais dinheiro do que deveria.
      </Callout>

      <AvaliarForm
        cycleId={cycle.id}
        initial={cycle.avaliar ?? emptyAvaliar()}
        initialPercentuais={cycle.percentuais}
        cicloLabel={cycleLabel(cycle.year, cycle.month)}
      />
    </div>
  );
}
