import { useState } from "react";
import { minimoViavel, zonas, tarefasRepresadas, rotinaTempoInfo } from "../data/method";
import { useBucketChecklist } from "../lib/storage";
import { hojeISO, semanaDoCiclo, chaveSemana } from "../lib/date";
import { Card, PageTitle, Pill, TaskRow } from "../components/ui";

const OPCOES = [15, 30, 60] as const;
type Opcao = (typeof OPCOES)[number];

export default function RotinaTempo() {
  const iso = hojeISO();
  const [selecionado, setSelecionado] = useState<Opcao>(15);

  const minimo = useBucketChecklist("minimo-viavel", iso);
  const zonaAtual = zonas[semanaDoCiclo(iso) - 1];
  const zona = useBucketChecklist(`zona-${zonaAtual.semana}`, chaveSemana(iso));
  const representadas = useBucketChecklist("tarefas-represadas", "global");

  const info = rotinaTempoInfo[selecionado];

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 4 do método"
        title="A casa em 15, 30 ou 60 minutos"
        subtitle="Escolha com honestidade, não com esperança. Se o dia está corrido, escolha 15 minutos — é uma rotina completa, não uma versão incompleta."
      />

      <div className="mb-6 flex gap-2">
        {OPCOES.map((op) => (
          <button
            key={op}
            onClick={() => setSelecionado(op)}
            className={`flex-1 rounded-xl border px-4 py-3 text-center font-semibold transition-colors ${
              selecionado === op
                ? "border-terracotta bg-terracotta text-white"
                : "border-ink/15 bg-white text-ink hover:border-terracotta/40"
            }`}
          >
            {op} min
          </button>
        ))}
      </div>

      <Card>
        <h2 className="font-serif text-xl text-ink">{info.titulo}</h2>
        <p className="mt-1 text-sm text-ink-soft">{info.descricao}</p>

        <div className="mt-4 flex flex-col gap-4">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Mínimo viável</p>
              <span className="text-xs text-ink-soft">
                {minimo.checked.size}/{minimoViavel.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {minimoViavel.map((t) => (
                <TaskRow
                  key={t.id}
                  label={t.label}
                  meta={t.time}
                  checked={minimo.isChecked(t.id)}
                  onToggle={() => minimo.toggle(t.id)}
                />
              ))}
            </div>
          </section>

          {selecionado >= 30 && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Tarefa da zona do dia
                </p>
                <Pill tone="sage">{zonaAtual.nome}</Pill>
              </div>
              <p className="mb-2 text-xs text-ink-soft">Escolha uma só. Termine ela antes de pensar em outra.</p>
              <div className="flex flex-col gap-2">
                {zonaAtual.banco.map((t) => (
                  <TaskRow
                    key={t.id}
                    label={t.label}
                    meta={`${t.minutes} min`}
                    checked={zona.isChecked(t.id)}
                    onToggle={() => zona.toggle(t.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {selecionado === 60 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Tarefa maior represada
              </p>
              <p className="mb-2 text-xs text-ink-soft">
                30 minutos focados. Quando o tempo acabar, pare — mesmo sem terminar.
              </p>
              <div className="flex flex-col gap-2">
                {tarefasRepresadas.map((t) => (
                  <TaskRow
                    key={t.id}
                    label={t.label}
                    checked={representadas.isChecked(t.id)}
                    onToggle={() => representadas.toggle(t.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </Card>
    </div>
  );
}
