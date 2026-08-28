import { resetSteps } from "../data/method";
import { useBucketChecklist } from "../lib/storage";
import { Card, PageTitle, ProgressBar } from "../components/ui";

export default function Reset() {
  const { isChecked, toggle, checked } = useBucketChecklist("reset", "atual");
  const concluido = checked.size === resetSteps.length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 6 do método"
        title="O reset da casa"
        subtitle="Não é faxina geral, e a casa não precisa ficar perfeita no final. É o processo mais curto possível pra voltar ao ponto em que o sistema normal volta a fazer sentido."
      />

      <Card className="mb-6 bg-butter-light/50 border-butter/40">
        <p className="text-sm text-ink">
          <strong>Quando usar:</strong> quando você olha pra casa e não consegue identificar por onde começar,
          porque tudo parece urgente ao mesmo tempo. Se você ainda consegue ver "hoje eu preciso fazer X", volte
          só ao mínimo viável — não precisa de reset.
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Protocolo, passo a passo</h2>
          {checked.size > 0 && (
            <button
              onClick={() => checked.forEach((id) => toggle(id))}
              className="text-xs font-medium text-ink-soft hover:text-terracotta-dark hover:underline"
            >
              Reiniciar
            </button>
          )}
        </div>

        <div className="mt-2">
          <ProgressBar value={checked.size} total={resetSteps.length} />
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {resetSteps.map((step) => {
            const id = String(step.ordem);
            const on = isChecked(id);
            return (
              <li key={id}>
                <label
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-4 transition-colors ${
                    on ? "border-sage/40 bg-sage-light/60" : "border-ink/10 bg-white hover:border-terracotta/40"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold ${
                      on ? "bg-sage text-white" : "bg-terracotta-light text-terracotta-dark"
                    }`}
                  >
                    {step.ordem}
                  </span>
                  <span className="flex-1">
                    <span className={`block font-medium ${on ? "text-ink-soft line-through" : "text-ink"}`}>
                      {step.titulo}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-soft">{step.descricao}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(id)}
                    className="mt-1 h-5 w-5 shrink-0 rounded-md border-ink/30"
                  />
                </label>
              </li>
            );
          })}
        </ol>

        {concluido && (
          <p className="mt-4 rounded-xl bg-sage-light px-4 py-3 text-sm text-sage-dark">
            Reset concluído. Amanhã, volte só ao mínimo viável — não tente compensar zonas perdidas de uma vez.
          </p>
        )}
      </Card>
    </div>
  );
}
