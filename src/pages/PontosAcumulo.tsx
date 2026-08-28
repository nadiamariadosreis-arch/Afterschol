import { Shirt, CookingPot, Blocks } from "lucide-react";
import { pontosAcumulo } from "../data/method";
import { Card, PageTitle } from "../components/ui";

const ICONS = { roupa: Shirt, cozinha: CookingPot, brinquedos: Blocks } as const;

export default function PontosAcumulo() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 7 do método"
        title="Roupa, cozinha e brinquedos"
        subtitle="Os três pontos que acumulam mais rápido que qualquer outro — porque a 'entrada' nunca para, e um pequeno atraso na saída já vira montanha."
      />

      <div className="flex flex-col gap-4">
        {pontosAcumulo.map((p) => {
          const Icon = ICONS[p.id as keyof typeof ICONS];
          return (
            <Card key={p.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta-light text-terracotta-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-serif text-xl text-ink">{p.nome}</h2>
              </div>
              <p className="mt-3 text-sm italic text-ink-soft">{p.resumo}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {p.regras.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
