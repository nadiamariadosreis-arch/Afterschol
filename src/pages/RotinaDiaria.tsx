import { Sunrise, DoorOpen, Moon } from "lucide-react";
import { rotinaDiaria } from "../data/method";
import { useBucketChecklist } from "../lib/storage";
import { hojeISO } from "../lib/date";
import { Card, PageTitle, ProgressBar, TaskRow } from "../components/ui";

const ICONS = { manha: Sunrise, chegada: DoorOpen, noite: Moon } as const;

export default function RotinaDiaria() {
  const iso = hojeISO();

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Parte 9 do método"
        title="A rotina de quem trabalha fora"
        subtitle="Nenhuma tarefa nova — só quando encaixar o que você já sabe: manhã, chegada em casa e noite."
      />

      <div className="flex flex-col gap-4">
        {rotinaDiaria.map((momento) => (
          <MomentoCard key={momento.id} iso={iso} momento={momento} />
        ))}
      </div>
    </div>
  );
}

function MomentoCard({ iso, momento }: { iso: string; momento: (typeof rotinaDiaria)[number] }) {
  const Icon = ICONS[momento.id as keyof typeof ICONS];
  const ids = momento.tarefas.map((_, i) => `${momento.id}-${i}`);
  const { isChecked, toggle, checked } = useBucketChecklist(`rotina-diaria-${momento.id}`, iso);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta-light text-terracotta-dark">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-xl text-ink">{momento.nome}</h2>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{momento.objetivo}</p>

      <div className="mt-4 flex flex-col gap-2">
        {momento.tarefas.map((t, i) => (
          <TaskRow key={ids[i]} label={t} checked={isChecked(ids[i])} onToggle={() => toggle(ids[i])} />
        ))}
      </div>

      <div className="mt-4">
        <ProgressBar value={checked.size} total={momento.tarefas.length} />
      </div>
    </Card>
  );
}
