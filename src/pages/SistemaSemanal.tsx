import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { zonas } from "../data/method";
import { useBucketChecklist, useCustomizableList } from "../lib/storage";
import { useCicloZonas } from "../lib/zonaCiclo";
import { hojeISO, chaveSemana } from "../lib/date";
import { AddTaskForm, Card, PageTitle, Pill, ProgressBar, TaskRow } from "../components/ui";

export default function SistemaSemanal() {
  const iso = hojeISO();
  const { ordem, zonaAtualId, posicaoDe, definirAtual, mover } = useCicloZonas();
  const [visualizando, setVisualizando] = useState(zonaAtualId);

  const zona = zonas.find((z) => z.semana === visualizando)!;
  const ehSemanaAtual = visualizando === zonaAtualId;
  const lista = useCustomizableList(`zona-${zona.semana}-lista`, String(zona.semana), zona.banco);
  const checklist = useBucketChecklist(`zona-${zona.semana}`, chaveSemana(iso));

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 5 do método"
        title="O sistema semanal"
        subtitle="Um cômodo por semana, em ciclo. A ordem é sua — cada casa tem uma prioridade diferente — e você decide em qual semana do ciclo está."
      />

      <Card className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Ordem do ciclo — arraste a prioridade com as setas
        </p>
        <div className="flex flex-col gap-2">
          {ordem.map((zonaId, index) => {
            const z = zonas.find((zz) => zz.semana === zonaId)!;
            const atual = zonaId === zonaAtualId;
            const selecionada = zonaId === visualizando;
            return (
              <div
                key={zonaId}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                  selecionada
                    ? "border-terracotta bg-terracotta-light/40"
                    : atual
                      ? "border-terracotta/30 bg-white"
                      : "border-ink/10 bg-white"
                }`}
              >
                <div className="flex shrink-0 flex-col">
                  <button
                    onClick={() => mover(zonaId, -1)}
                    disabled={index === 0}
                    aria-label={`Mover ${z.nome} pra cima`}
                    className="text-ink-soft/60 hover:text-terracotta-dark disabled:opacity-20"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => mover(zonaId, 1)}
                    disabled={index === ordem.length - 1}
                    aria-label={`Mover ${z.nome} pra baixo`}
                    className="text-ink-soft/60 hover:text-terracotta-dark disabled:opacity-20"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <button onClick={() => setVisualizando(zonaId)} className="flex flex-1 items-baseline gap-2 text-left">
                  <span className="font-serif text-sm text-ink-soft">Semana {index + 1}</span>
                  <span className={`font-medium ${selecionada ? "text-terracotta-dark" : "text-ink"}`}>
                    {z.nome}
                  </span>
                </button>

                {atual ? (
                  <Pill>Atual</Pill>
                ) : (
                  <button
                    onClick={() => definirAtual(zonaId)}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-terracotta/50 hover:text-terracotta-dark"
                  >
                    <MapPin className="h-3 w-3" /> Estou aqui
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl text-ink">
            Semana {posicaoDe(zona.semana)} · {zona.nome}
          </h2>
          {ehSemanaAtual ? <Pill>Semana atual</Pill> : <Pill tone="sage">Prévia</Pill>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">{zona.descricao}</p>

        {ehSemanaAtual && (
          <div className="mt-4">
            <ProgressBar value={checklist.checked.size} total={lista.items.length} />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {lista.items.map((t) =>
            ehSemanaAtual ? (
              <TaskRow
                key={t.id}
                label={t.label}
                meta={t.minutes ? `${t.minutes} min` : undefined}
                checked={checklist.isChecked(t.id)}
                onToggle={() => checklist.toggle(t.id)}
                onRemove={() => lista.removeItem(t.id)}
              />
            ) : (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink-soft"
              >
                <span>{t.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {t.minutes && (
                    <span className="rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium">
                      {t.minutes} min
                    </span>
                  )}
                  <button
                    onClick={() => lista.removeItem(t.id)}
                    aria-label={`Remover "${t.label}"`}
                    className="rounded-full p-1 text-ink-soft/60 hover:bg-terracotta-light hover:text-terracotta-dark"
                  >
                    ×
                  </button>
                </span>
              </div>
            ),
          )}
        </div>

        <div className="mt-4">
          <AddTaskForm
            onAdd={({ label, minutes }) => lista.addCustom({ label, minutes })}
            placeholder={`Adicionar tarefa em "${zona.nome}"...`}
            withMinutes
          />
        </div>

        {lista.temOcultos && (
          <button
            onClick={lista.restaurarPadrao}
            className="mt-3 text-xs font-medium text-ink-soft hover:text-terracotta-dark hover:underline"
          >
            Restaurar tarefas originais dessa zona
          </button>
        )}
      </Card>

      <p className="mt-6 text-sm text-ink-soft">
        Essa lista é só o ponto de partida sugerido pelo método — ajuste pra sua casa: remova o que não se
        aplica e adicione o que falta. Se sobrarem tarefas no fim da semana, tudo bem — elas esperam até a
        próxima vez que esse cômodo entrar no ciclo.
      </p>
    </div>
  );
}
