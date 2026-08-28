import { Check } from "lucide-react";
import { minimoViavel, plano21 } from "../data/method";
import { useBucketChecklist, usePlanoInicio } from "../lib/storage";
import { adicionarDias, diaDoPlano, hojeISO } from "../lib/date";
import { Card, PageTitle, Pill } from "../components/ui";

export default function Plano21() {
  const iso = hojeISO();
  const [inicio, setInicio] = usePlanoInicio();
  const { store: minimoStore } = useBucketChecklist("minimo-viavel", iso);
  const idsMinimo = minimoViavel.map((t) => t.id);

  const diaAtual = inicio ? diaDoPlano(inicio, iso) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 10 do método"
        title="Plano de 21 dias"
        subtitle="Cada semana só adiciona uma camada nova em cima da anterior. Você não aplica o método inteiro já no primeiro dia."
      />

      <Card className="mb-6">
        {!inicio ? (
          <>
            <p className="text-sm text-ink">Escolha quando começar o desafio dos 21 dias.</p>
            <button
              onClick={() => setInicio(iso)}
              className="mt-3 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
            >
              Começar hoje
            </button>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">Início em {formatCurto(inicio)}</p>
              <p className="font-serif text-lg text-ink">
                {diaAtual && diaAtual <= 21
                  ? `Dia ${diaAtual} de 21`
                  : diaAtual && diaAtual > 21
                    ? "Plano concluído — modo manutenção"
                    : "Começa em breve"}
              </p>
            </div>
            <button
              onClick={() => setInicio(iso)}
              className="text-xs font-medium text-ink-soft hover:text-terracotta-dark hover:underline"
            >
              Recomeçar hoje
            </button>
          </div>
        )}
      </Card>

      {inicio && (
        <Card className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Os 21 dias</p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }, (_, i) => i + 1).map((dia) => {
              const dataDia = adicionarDias(inicio, dia - 1);
              const feito = idsMinimo.every((id) => (minimoStore[dataDia] ?? []).includes(id));
              const passado = dataDia < iso;
              const ehHoje = dataDia === iso;
              const futuro = dataDia > iso;

              return (
                <div
                  key={dia}
                  title={formatCurto(dataDia)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-xs font-semibold ${
                    ehHoje
                      ? "border-terracotta ring-2 ring-terracotta/40"
                      : futuro
                        ? "border-ink/10 text-ink-soft/50"
                        : "border-ink/10"
                  } ${feito ? "bg-sage-light text-sage-dark" : passado ? "bg-terracotta-light/40 text-terracotta-dark" : "bg-white text-ink-soft"}`}
                >
                  {feito ? <Check className="h-4 w-4" /> : dia}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {plano21.map((semana) => (
          <Card key={semana.semana}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl text-ink">
                Semana {semana.semana} · {semana.titulo}
              </h2>
              <Pill tone={semana.semana === 1 ? "terracotta" : semana.semana === 2 ? "butter" : "sage"}>
                {semana.foco}
              </Pill>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{semana.descricao}</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {semana.dicas.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatCurto(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
