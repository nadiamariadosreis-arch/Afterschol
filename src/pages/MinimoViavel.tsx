import { Flame } from "lucide-react";
import { minimoViavel } from "../data/method";
import { useBucketChecklist, useStreak } from "../lib/storage";
import { hojeISO, formatarDataLonga } from "../lib/date";
import { Card, PageTitle, ProgressBar, TaskRow } from "../components/ui";

export default function MinimoViavel() {
  const iso = hojeISO();
  const ids = minimoViavel.map((t) => t.id);
  const { isChecked, toggle, checked } = useBucketChecklist("minimo-viavel", iso);
  const streak = useStreak("minimo-viavel", ids, iso);

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 3 do método"
        title="O mínimo viável"
        subtitle="O pequeno grupo de tarefas que, feitas todos os dias, mantêm sua casa funcional — não perfeita, funcional. É o único pilar que não pode falhar."
      />

      <Card className="mb-6 bg-sage-light/40 border-sage/30">
        <p className="text-sm text-ink">
          Cada tarefa adiada não desaparece — ela espera, cresce, e o que era 5 minutos vira 40. O mínimo viável
          existe pra interromper esse acúmulo antes que ele comece.
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">{formatarDataLonga(iso)}</h2>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-terracotta-dark">
              <Flame className="h-4 w-4" /> streak de {streak} {streak === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {minimoViavel.map((t) => (
            <TaskRow
              key={t.id}
              label={t.label}
              detail={t.detail}
              meta={t.time}
              checked={isChecked(t.id)}
              onToggle={() => toggle(t.id)}
            />
          ))}
        </div>

        <div className="mt-4">
          <ProgressBar value={checked.size} total={minimoViavel.length} />
        </div>
      </Card>

      <p className="mt-6 text-sm text-ink-soft">
        Essas cinco são o ponto de partida sugerido pelo método — não uma regra rígida. Se sua casa pede ajustes
        (apartamento pequeno, filhos pequenos, com ou sem ajuda), trate o princípio como inegociável, não a lista
        exata.
      </p>
    </div>
  );
}
