"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DesafioDef } from "@/lib/apfa/desafios";
import type { DesafioProgressoRow } from "@/lib/supabase/types";
import { iniciarDesafioAction, concluirDesafioAction } from "./actions";

export function DesafiosClient({
  desafiosSemana,
  desafiosMes,
  progresso,
}: {
  desafiosSemana: DesafioDef[];
  desafiosMes: DesafioDef[];
  progresso: DesafioProgressoRow[];
}) {
  const porChave = new Map(progresso.map((p) => [p.chave, p]));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h3 className="font-display-italic font-semibold text-[22px] text-ink mb-4">Desafios da semana</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {desafiosSemana.map((d) => (
            <DesafioCard key={d.chave} desafio={d} progresso={porChave.get(d.chave)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display-italic font-semibold text-[22px] text-ink mb-4">Desafios do mês</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {desafiosMes.map((d) => (
            <DesafioCard key={d.chave} desafio={d} progresso={porChave.get(d.chave)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DesafioCard({ desafio, progresso }: { desafio: DesafioDef; progresso?: DesafioProgressoRow }) {
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(progresso);
  const [agora] = useState(() => Date.now());

  const concluido = Boolean(local?.concluido_em);
  const iniciado = Boolean(local && !concluido);

  const diasPassados = local
    ? Math.floor((agora - new Date(local.iniciado_em).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const progressoPct = Math.max(0, Math.min(100, (diasPassados / desafio.duracaoDias) * 100));

  function iniciar() {
    startTransition(async () => {
      await iniciarDesafioAction(desafio.chave);
      setLocal({
        id: local?.id ?? "",
        family_id: local?.family_id ?? "",
        chave: desafio.chave,
        iniciado_em: new Date().toISOString(),
        concluido_em: null,
        created_at: local?.created_at ?? new Date().toISOString(),
      });
    });
  }

  function concluir() {
    startTransition(async () => {
      await concluirDesafioAction(desafio.chave);
      setLocal((atual) => (atual ? { ...atual, concluido_em: new Date().toISOString() } : atual));
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">{desafio.titulo}</h4>
        <p className="text-ink/60 text-[14px]">{desafio.explicacao}</p>
      </div>
      <p className="text-[12px] text-ink/45 uppercase tracking-wide font-semibold">
        Duração: {desafio.duracaoDias === 7 ? "7 dias" : "1 mês"}
      </p>

      {concluido ? (
        <div className="flex items-center gap-2 text-sage font-semibold text-[14px]">
          ✓ Concluído{" "}
          {local?.concluido_em ? `em ${new Date(local.concluido_em).toLocaleDateString("pt-BR")}` : ""}
        </div>
      ) : iniciado ? (
        <div className="flex flex-col gap-2">
          <div className="h-2 rounded-full bg-cream-dark overflow-hidden">
            <div className="h-full rounded-full bg-orange" style={{ width: `${progressoPct}%` }} />
          </div>
          <Button type="button" onClick={concluir} disabled={pending} variant="secondary" className="self-start">
            {pending ? "Salvando…" : "Marcar como concluído"}
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={iniciar} disabled={pending} className="self-start">
          {pending ? "Iniciando…" : "Iniciar desafio"}
        </Button>
      )}
    </Card>
  );
}
