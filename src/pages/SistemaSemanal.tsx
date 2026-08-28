import { useState } from "react";
import { zonas } from "../data/method";
import { useBucketChecklist } from "../lib/storage";
import { hojeISO, semanaDoCiclo, chaveSemana } from "../lib/date";
import { Card, PageTitle, Pill, ProgressBar, TaskRow } from "../components/ui";

export default function SistemaSemanal() {
  const iso = hojeISO();
  const semanaAtual = semanaDoCiclo(iso);
  const [visualizando, setVisualizando] = useState(semanaAtual);

  const zona = zonas[visualizando - 1];
  const ehSemanaAtual = visualizando === semanaAtual;
  const checklist = useBucketChecklist(`zona-${zona.semana}`, chaveSemana(iso));

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 5 do método"
        title="O sistema semanal"
        subtitle="Um cômodo por semana, em ciclo. Você não escolhe mais qual cômodo — já sabe. Escolhe só qual tarefa cabe no tempo que sobrou hoje."
      />

      <div className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-2">
        {zonas.map((z) => (
          <button
            key={z.semana}
            onClick={() => setVisualizando(z.semana)}
            className={`rounded-xl border px-1.5 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm ${
              visualizando === z.semana
                ? "border-terracotta bg-terracotta text-white"
                : z.semana === semanaAtual
                  ? "border-terracotta/40 bg-terracotta-light text-terracotta-dark"
                  : "border-ink/15 bg-white text-ink-soft hover:border-terracotta/40"
            }`}
          >
            Sem. {z.semana}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl text-ink">{zona.nome}</h2>
          {ehSemanaAtual ? <Pill>Semana atual</Pill> : <Pill tone="sage">Prévia</Pill>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">{zona.descricao}</p>

        {ehSemanaAtual && (
          <div className="mt-4">
            <ProgressBar value={checklist.checked.size} total={zona.banco.length} />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {zona.banco.map((t) =>
            ehSemanaAtual ? (
              <TaskRow
                key={t.id}
                label={t.label}
                meta={`${t.minutes} min`}
                checked={checklist.isChecked(t.id)}
                onToggle={() => checklist.toggle(t.id)}
              />
            ) : (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink-soft"
              >
                <span>{t.label}</span>
                <span className="shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium">
                  {t.minutes} min
                </span>
              </div>
            ),
          )}
        </div>
      </Card>

      <p className="mt-6 text-sm text-ink-soft">
        Se sobrarem tarefas do banco no fim da semana, tudo bem — elas esperam até a próxima vez que esse cômodo
        entrar no ciclo, daqui a 5 semanas. Não tente compensar pegando um combo maior no dia seguinte.
      </p>
    </div>
  );
}
