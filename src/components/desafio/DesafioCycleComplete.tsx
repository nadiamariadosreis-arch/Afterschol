interface Props {
  pendingCount: number;
  onStartNewCycle: () => void;
}

export function DesafioCycleComplete({ pendingCount, onStartNewCycle }: Props) {
  return (
    <section className="rounded-3xl bg-gold-50 border border-gold-200 p-6 sm:p-8 text-center">
      <p className="inline-block px-3 py-1 rounded-full bg-gold-500 text-white text-xs font-bold uppercase tracking-wide">
        Ciclo de 21 dias concluído
      </p>
      <h2 className="mt-3 text-xl font-extrabold text-ink">
        {pendingCount > 0
          ? `Ainda restam ${pendingCount} tarefa${pendingCount > 1 ? "s" : ""} na fila.`
          : "Você zerou a fila do desafio!"}
      </h2>
      <p className="mt-2 text-ink-soft">
        {pendingCount > 0
          ? "Sem problema — elas seguem com você pro próximo ciclo de 21 dias, sem precisar recadastrar nada."
          : "As tarefas concluídas já viraram manutenção automática na sua rotina normal."}
      </p>
      <button
        type="button"
        onClick={onStartNewCycle}
        className="mt-5 px-8 py-3 rounded-full bg-gold-600 text-white font-extrabold text-base shadow-md hover:bg-gold-700 transition-colors"
      >
        Começar novo ciclo de 21 dias
      </button>
    </section>
  );
}
