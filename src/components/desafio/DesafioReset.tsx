import { useState } from "react";

interface ResetStep {
  title: string;
  description: string;
}

const RESET_STEPS: ResetStep[] = [
  {
    title: "1. Lixo — a casa inteira",
    description:
      "Passe por todos os cômodos recolhendo lixo, sem parar pra organizar mais nada. Não exige nenhuma decisão — é só coletar e descartar.",
  },
  {
    title: "2. Louça — tudo de uma vez",
    description:
      "Lave (ou coloque na máquina) toda a louça acumulada. Resolver a cozinha primeiro muda o clima emocional da casa inteira.",
  },
  {
    title: "3. Roupa — separar e começar",
    description:
      "Separe suja de limpa. Coloque uma lavagem pra rodar. Dobre e guarde o que já estiver limpo, mesmo que seja uma pilha grande.",
  },
  {
    title: "4. Superfícies e chão — uma passada rápida",
    description:
      "Tire o que está fora do lugar nas superfícies principais (mesa, bancada, sofá) e passe uma vassourinha ou pano nas áreas de maior circulação.",
  },
];

export function DesafioReset() {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const allDone = done.size === RESET_STEPS.length;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-white border border-terracotta-100 shadow-sm p-6 sm:p-8">
        <span className="inline-block px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 text-xs font-bold uppercase tracking-wide">
          Reset da casa
        </span>
        <h2 className="mt-3 text-xl font-extrabold text-ink">
          Pra quando a casa saiu do controle de vez
        </h2>
        <p className="mt-2 text-ink-soft">
          Reset não é faxina geral, e a casa não precisa ficar perfeita no final. É o processo mais
          curto possível pra voltar ao ponto em que o mínimo viável volta a fazer sentido. A ordem
          é fixa — cada passo prepara o seguinte, então siga a sequência.
        </p>
      </section>

      <section className="rounded-3xl bg-white border border-cream-soft p-6 sm:p-8">
        <ol className="flex flex-col gap-3">
          {RESET_STEPS.map((step, i) => {
            const isDone = done.has(i);
            return (
              <li
                key={step.title}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  isDone ? "bg-sage-50 border-sage-100" : "bg-cream border-cream-soft"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={isDone}
                  aria-label={isDone ? `Marcar "${step.title}" como não feito` : `Marcar "${step.title}" como feito`}
                  className={`shrink-0 mt-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors ${
                    isDone
                      ? "bg-sage-500 border-sage-500 text-white"
                      : "border-terracotta-300 text-transparent hover:border-terracotta-500"
                  }`}
                >
                  ✓
                </button>
                <div>
                  <p className={`font-bold text-ink ${isDone ? "line-through decoration-sage-500/60" : ""}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-ink-soft mt-1">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-2xl border border-dashed border-terracotta-200 p-4">
          <p className="font-bold text-ink">5. Voltar ao mínimo viável, já no dia seguinte</p>
          <p className="text-sm text-ink-soft mt-1">
            O reset termina aqui — não numa casa perfeita, mas numa casa que já pode voltar a ser
            sustentada pelo mínimo viável comum. Não tente compensar zonas perdidas: elas voltam
            sozinhas no lugar certo da rotação semanal.
          </p>
        </div>

        {allDone && (
          <p className="mt-4 text-center text-sm font-semibold text-sage-600">
            Reset feito. A partir de amanhã, você já está de volta ao sistema normal. 💛
          </p>
        )}
      </section>
    </div>
  );
}
