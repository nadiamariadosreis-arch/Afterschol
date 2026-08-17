import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Callout } from "@/components/ui/Callout";
import { DESAFIOS_SEMANA, DESAFIOS_MES } from "@/lib/apfa/desafios";
import type { DesafioProgressoRow } from "@/lib/supabase/types";
import { DesafiosClient } from "./DesafiosClient";

export default async function DesafiosPage() {
  const profile = await requireMember();
  const supabase = await createClient();
  const { data } = await supabase.from("desafios_progresso").select("*").eq("family_id", profile.id);
  const progresso = (data ?? []) as DesafioProgressoRow[];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Desafios"
        title="Desafios"
        subtitle="Pequenos desafios comportamentais, escolhidos por você — sem obrigação, no seu ritmo."
      />
      <Callout title="Como funciona">
        Escolha o desafio que fizer sentido pra sua família agora. Nada aqui é obrigatório nem
        precisa ser feito ao mesmo tempo que os pilares — é um jeito leve de treinar um hábito de
        cada vez.
      </Callout>

      <DesafiosClient desafiosSemana={DESAFIOS_SEMANA} desafiosMes={DESAFIOS_MES} progresso={progresso} />
    </div>
  );
}
