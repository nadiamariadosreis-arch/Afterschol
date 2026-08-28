import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";
import { minimoViavel, zonas, plano21 } from "../data/method";
import { useBucketChecklist, usePlanoInicio, useStreak } from "../lib/storage";
import { hojeISO, formatarDataLonga, semanaDoCiclo, diaDoPlano, semanaDoPlano, chaveSemana } from "../lib/date";
import { Card, PageTitle, Pill, ProgressBar, TaskRow } from "../components/ui";

export default function Hoje() {
  const iso = hojeISO();
  const ids = minimoViavel.map((t) => t.id);
  const { isChecked, toggle, checked } = useBucketChecklist("minimo-viavel", iso);
  const streak = useStreak("minimo-viavel", ids, iso);

  const [inicio, setInicio] = usePlanoInicio();
  const dia = inicio ? diaDoPlano(inicio, iso) : null;
  const semanaPlano = dia ? semanaDoPlano(dia) : null;
  const semanaAtual = plano21.find((s) => s.semana === semanaPlano);

  const zonaAtual = zonas[semanaDoCiclo(iso) - 1];
  const zonaChecklist = useBucketChecklist(`zona-${zonaAtual.semana}`, chaveSemana(iso));

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow={formatarDataLonga(iso)}
        title="Hoje"
        subtitle="Você não precisa de mais tempo. Precisa saber exatamente o que fazer com o tempo que tem."
      />

      {!inicio && (
        <Card className="mb-6 border-terracotta/30 bg-terracotta-light/40">
          <p className="font-medium text-ink">Ainda não começou o plano de 21 dias?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Comece hoje pela Semana 1: só o mínimo viável, todos os dias, sem adicionar mais nada.
          </p>
          <button
            onClick={() => setInicio(iso)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
          >
            Começar o plano hoje <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
      )}

      {inicio && dia && semanaAtual && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Pill>Dia {Math.min(dia, 21)} de 21</Pill>
            </div>
            <Link to="/plano-21" className="text-sm font-medium text-terracotta-dark hover:underline">
              Ver plano completo →
            </Link>
          </div>
          <p className="mt-3 font-serif text-lg text-ink">
            Semana {semanaAtual.semana} · {semanaAtual.titulo}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{semanaAtual.foco}</p>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Mínimo viável de hoje</h2>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-terracotta-dark">
              <Flame className="h-4 w-4" /> {streak} {streak === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-soft">As 5 tarefas não negociáveis. Todo dia, não importa o quão corrido.</p>

        <div className="mt-4 flex flex-col gap-2">
          {minimoViavel.map((t) => (
            <TaskRow
              key={t.id}
              label={t.label}
              meta={t.time}
              checked={isChecked(t.id)}
              onToggle={() => toggle(t.id)}
            />
          ))}
        </div>

        <div className="mt-4">
          <ProgressBar value={checked.size} total={minimoViavel.length} />
        </div>

        <Link
          to="/tempo"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-dark hover:underline"
        >
          Tenho mais tempo hoje — ver rotina de 30 ou 60 min <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">
            Zona da semana: <span className="text-terracotta-dark">{zonaAtual.nome}</span>
          </h2>
          <Link to="/semanal" className="text-sm font-medium text-terracotta-dark hover:underline">
            Ver tudo →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{zonaAtual.descricao}</p>
        <div className="mt-3">
          <ProgressBar value={zonaChecklist.checked.size} total={zonaAtual.banco.length} />
        </div>
      </Card>
    </div>
  );
}
