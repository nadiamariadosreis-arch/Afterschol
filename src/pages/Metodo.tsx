import { pilares, tresErros } from "../data/method";
import { Card, PageTitle } from "../components/ui";

export default function Metodo() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle eyebrow="Partes 1 e 2 do método" title="Sobre o Casa em Ordem" />

      <Card className="mb-6 bg-terracotta-light/40 border-terracotta/30">
        <p className="font-serif text-xl leading-snug text-ink">
          "Você não precisa de mais tempo. Precisa saber exatamente o que fazer com o tempo que tem."
        </p>
      </Card>

      <Card className="mb-6">
        <h2 className="font-serif text-xl text-ink">O problema nunca foi você</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Organização não é um dom — é um sistema, e sistema se aprende. O que falta não é esforço, é uma
          direção pro esforço que você já tem.
        </p>
        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Os 3 erros que fazem a casa desandar sempre no mesmo ponto
        </p>
        <ul className="flex flex-col gap-2">
          {tresErros.map((erro, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
              {erro}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-serif text-xl text-ink">Os 4 pilares do método</h2>
        <div className="mt-4 flex flex-col gap-4">
          {pilares.map((p, i) => (
            <div key={p.id} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-light font-serif text-sm font-semibold text-sage-dark">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-ink">{p.nome}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{p.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
