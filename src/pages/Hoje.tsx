import { Link, useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Sparkles, RotateCcw, LayoutGrid } from "lucide-react";
import { minimoViavel, zonas, plano21 } from "../data/method";
import { useBucketChecklist, useCustomizableList, usePlanoInicio, usePontoPartida, useStreak, type PontoPartida } from "../lib/storage";
import { hojeISO, formatarDataLonga, semanaDoCiclo, diaDoPlano, semanaDoPlano, chaveSemana } from "../lib/date";
import { Card, PageTitle, Pill, ProgressBar, TaskRow } from "../components/ui";

export default function Hoje() {
  const iso = hojeISO();
  const navigate = useNavigate();
  const [pontoPartida, setPontoPartida] = usePontoPartida();

  const { items: minimoItems } = useCustomizableList("minimo-viavel-lista", "geral", minimoViavel);
  const ids = minimoItems.map((t) => t.id);
  const { isChecked, toggle, checked } = useBucketChecklist("minimo-viavel", iso);
  const streak = useStreak("minimo-viavel", ids, iso);

  const [inicio, setInicio] = usePlanoInicio();
  const dia = inicio ? diaDoPlano(inicio, iso) : null;
  const semanaPlano = dia ? semanaDoPlano(dia) : null;
  const semanaAtual = plano21.find((s) => s.semana === semanaPlano);

  const zonaAtual = zonas[semanaDoCiclo(iso) - 1];
  const zonaCustom = useCustomizableList(`zona-${zonaAtual.semana}-lista`, String(zonaAtual.semana), zonaAtual.banco);
  const zonaChecklist = useBucketChecklist(`zona-${zonaAtual.semana}`, chaveSemana(iso));

  function escolherPartida(p: PontoPartida) {
    setPontoPartida(p);
    if (p === "reset") navigate("/reset");
    if (p === "plano21" && !inicio) setInicio(iso);
    if (p === "manutencao") navigate("/semanal");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow={formatarDataLonga(iso)}
        title="Hoje"
        subtitle="Você não precisa de mais tempo. Precisa saber exatamente o que fazer com o tempo que tem."
      />

      {!pontoPartida ? (
        <Card className="mb-6 border-terracotta/30 bg-terracotta-light/40">
          <p className="font-medium text-ink">Como sua casa está hoje?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cada casa tem uma realidade — o método se adapta a ela, não o contrário. Escolha por onde faz mais
            sentido começar.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <PartidaOpcao
              icon={RotateCcw}
              titulo="Está fora de controle"
              descricao='Não consigo identificar por onde começar, tudo parece urgente ao mesmo tempo → comece pelo reset.'
              onClick={() => escolherPartida("reset")}
            />
            <PartidaOpcao
              icon={Sparkles}
              titulo="Bagunçada, mas dá pra ver o que fazer"
              descricao="Consigo ver o que precisa hoje → comece pelo plano de 21 dias, Semana 1: só o mínimo viável."
              onClick={() => escolherPartida("plano21")}
            />
            <PartidaOpcao
              icon={LayoutGrid}
              titulo="Já é organizada, quero manter o ritmo"
              descricao="Pule direto pro sistema semanal e pra rotina diária, sem passar pelo plano do zero."
              onClick={() => escolherPartida("manutencao")}
            />
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setPontoPartida(null)}
          className="mb-6 text-xs font-medium text-ink-soft hover:text-terracotta-dark hover:underline"
        >
          Mudar ponto de partida
        </button>
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
        <p className="mt-1 text-sm text-ink-soft">
          As tarefas não negociáveis. Todo dia, não importa o quão corrido.{" "}
          <Link to="/minimo" className="font-medium text-terracotta-dark hover:underline">
            Ajustar lista
          </Link>
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {minimoItems.map((t) => (
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
          <ProgressBar value={checked.size} total={minimoItems.length} />
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
          <ProgressBar value={zonaChecklist.checked.size} total={zonaCustom.items.length} />
        </div>
      </Card>
    </div>
  );
}

function PartidaOpcao({
  icon: Icon,
  titulo,
  descricao,
  onClick,
}: {
  icon: typeof Sparkles;
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 text-left transition-colors hover:border-terracotta/50"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-light text-terracotta-dark">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block font-medium text-ink">{titulo}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">{descricao}</span>
      </span>
    </button>
  );
}
