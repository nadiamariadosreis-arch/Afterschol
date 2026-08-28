import { Flame } from "lucide-react";
import { minimoViavel } from "../data/method";
import { useBucketChecklist, useCustomizableList, useStreak } from "../lib/storage";
import { hojeISO, formatarDataLonga } from "../lib/date";
import { AddTaskForm, Card, PageTitle, ProgressBar, TaskRow } from "../components/ui";

export default function MinimoViavel() {
  const iso = hojeISO();
  const { items, addCustom, removeItem, temOcultos, restaurarPadrao } = useCustomizableList(
    "minimo-viavel-lista",
    "geral",
    minimoViavel,
  );
  const ids = items.map((t) => t.id);
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
          {items.map((t) => (
            <TaskRow
              key={t.id}
              label={t.label}
              detail={t.detail}
              meta={t.time}
              checked={isChecked(t.id)}
              onToggle={() => toggle(t.id)}
              onRemove={() => removeItem(t.id)}
            />
          ))}
        </div>

        <div className="mt-4">
          <AddTaskForm onAdd={({ label }) => addCustom({ label, detail: "", time: "" })} placeholder="Ex: tirar o cachorro pra passear" />
        </div>

        <div className="mt-4">
          <ProgressBar value={checked.size} total={items.length} />
        </div>

        {temOcultos && (
          <button
            onClick={restaurarPadrao}
            className="mt-3 text-xs font-medium text-ink-soft hover:text-terracotta-dark hover:underline"
          >
            Restaurar as 5 tarefas originais do método
          </button>
        )}
      </Card>

      <p className="mt-6 text-sm text-ink-soft">
        Essas cinco são o ponto de partida sugerido pelo método — não uma regra rígida. "Anote as suas cinco",
        diz o próprio material: pode ser exatamente essa lista, ou uma versão ajustada pra realidade da sua casa.
        Remova o que não faz sentido pra você e adicione o que faz.
      </p>
    </div>
  );
}
