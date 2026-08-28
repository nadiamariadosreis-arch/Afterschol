import { criancas } from "../data/method";
import { Card, PageTitle } from "../components/ui";

export default function Criancas() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 8 do método"
        title="Crianças que ajudam em casa"
        subtitle="Cada tarefa que uma criança aprende a fazer sozinha sai da sua lista pra sempre, não só naquele dia. Ensine junto antes de cobrar sozinha — e elogie o esforço, não a perfeição."
      />

      <div className="flex flex-col gap-4">
        {criancas.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-xl text-ink">{c.faixa}</h2>
            </div>
            <p className="mt-1 text-sm italic text-ink-soft">{c.objetivo}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {c.tarefas.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-butter-light/50 border-butter/40">
        <p className="text-sm text-ink">
          Transforme a tarefa em parte fixa da rotina, não em um pedido que você faz toda vez. Quando algo é
          "regra da casa", a criança para de sentir que está sendo mandada por você.
        </p>
      </Card>
    </div>
  );
}
