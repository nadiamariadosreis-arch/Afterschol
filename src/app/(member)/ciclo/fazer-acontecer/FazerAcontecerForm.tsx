"use client";

import { useActionState, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { salvarFazerAcontecerAction, autosalvarFazerAcontecerAction, type FazerAcontecerState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AutosaveIndicator } from "@/components/ui/AutosaveIndicator";
import { useAutosave } from "@/lib/useAutosave";
import { formatBRL } from "@/lib/format";
import type { ExecucaoItem, FazerAcontecerData } from "@/lib/apfa/types";

const ORIGEM_LABEL: Record<ExecucaoItem["origem"], string> = {
  divida: "Dívida",
  mes: "Conta do mês",
  cartao: "Cartão de crédito",
  reserva: "Reserva",
};

const initialState: FazerAcontecerState = {};

export function FazerAcontecerForm({ cycleId, initial }: { cycleId: string; initial: FazerAcontecerData }) {
  const [state, formAction, pending] = useActionState(salvarFazerAcontecerAction, initialState);
  const [reserva, setReserva] = useState(initial.reserva);
  const [itens, setItens] = useState<ExecucaoItem[]>(initial.itens);

  function updateItem(id: string, patch: Partial<ExecucaoItem>) {
    setItens((i) => i.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  // Reordenar segurando e arrastando: pointer events cobrem mouse e toque
  // com o mesmo código. O item arrastado troca de posição com o item por
  // baixo do ponteiro, ao vivo, enquanto a mão se move.
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const draggingId = useRef<string | null>(null);

  function registrarItemRef(id: string, el: HTMLDivElement | null) {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }

  function onHandlePointerDown(id: string, e: ReactPointerEvent<HTMLButtonElement>) {
    draggingId.current = id;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const dragId = draggingId.current;
    if (!dragId) return;
    const y = e.clientY;
    let alvoId: string | null = null;
    for (const [id, el] of itemRefs.current) {
      if (id === dragId) continue;
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        alvoId = id;
        break;
      }
    }
    if (!alvoId) return;
    setItens((atual) => {
      const de = atual.findIndex((i) => i.id === dragId);
      const para = atual.findIndex((i) => i.id === alvoId);
      if (de === -1 || para === -1 || de === para) return atual;
      const copia = [...atual];
      const [movido] = copia.splice(de, 1);
      copia.splice(para, 0, movido);
      return copia;
    });
  }

  function onHandlePointerUp() {
    draggingId.current = null;
  }

  const [completedAt] = useState(initial.completed_at);
  const payload: FazerAcontecerData = { reserva, itens, completed_at: completedAt };

  const autosaveStatus = useAutosave(payload, (draft) => autosalvarFazerAcontecerAction(cycleId, draft));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="fazerAcontecer" value={JSON.stringify(payload)} readOnly />

      <Card className="flex flex-col gap-4">
        <div>
          <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Reserva</h3>
          <p className="text-ink/60 text-[14px]">
            Assim que o dinheiro entra, a reserva vai direto para a conta definida com antecedência —
            sem decidir de novo todo mês.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-ink/70">Banco</span>
            <input
              type="text"
              value={reserva.banco}
              onChange={(e) => setReserva({ ...reserva, banco: e.target.value })}
              className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-ink/70">Conta destino</span>
            <input
              type="text"
              value={reserva.conta_destino}
              onChange={(e) => setReserva({ ...reserva, conta_destino: e.target.value })}
              className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
            />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={reserva.guardado}
              onChange={(e) =>
                setReserva({ ...reserva, guardado: e.target.checked, data: e.target.checked ? new Date().toISOString().slice(0, 10) : null })
              }
            />
            Já separei a reserva deste mês
          </label>
          {reserva.guardado ? (
            <input
              type="date"
              value={reserva.data ?? ""}
              onChange={(e) => setReserva({ ...reserva, data: e.target.value })}
              className="border border-line bg-cream rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-orange"
            />
          ) : null}
        </div>
      </Card>

      <div>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Checklist de execução</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          No dia em que o dinheiro cai, decida e execute na hora — marque cada item assim que
          separar ou pagar, mesmo que o vencimento seja depois. Vem organizado pela data de
          vencimento, mas segure o <span aria-hidden>⠿</span> e arraste pra mudar a ordem do jeito
          que fizer mais sentido pra família.
        </p>
        {itens.length === 0 ? (
          <Card>
            <p className="text-ink/60 text-[14px]">
              Nenhum item para executar ainda — volte ao Planejar para organizar as dívidas, o mês e
              o cartão.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {itens.map((item) => (
              <div key={item.id} ref={(el) => registrarItemRef(item.id, el)}>
                <Card className={`flex items-center gap-3 flex-wrap ${item.executado ? "bg-orange-light/20" : ""}`}>
                  <button
                    type="button"
                    onPointerDown={(e) => onHandlePointerDown(item.id, e)}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={onHandlePointerUp}
                    aria-label="Arrastar para reordenar"
                    className="touch-none select-none cursor-grab active:cursor-grabbing text-ink/30 hover:text-ink/60 text-[18px] leading-none shrink-0 px-1"
                  >
                    ⠿
                  </button>
                  <input type="checkbox" checked={item.executado} onChange={(e) => updateItem(item.id, { executado: e.target.checked, data: e.target.checked ? new Date().toISOString().slice(0, 10) : null })} />
                  <div className="flex-1 min-w-[180px]">
                    <span className="text-[12px] uppercase tracking-wide text-ink/40 font-semibold">{ORIGEM_LABEL[item.origem]}</span>
                    <p className="text-[15px] text-ink">{item.descricao}</p>
                    {item.dia_vencimento ? <span className="text-[12px] text-ink/50">Vence dia {item.dia_vencimento}</span> : null}
                  </div>
                  {item.valor ? <span className="text-[14px] text-ink/70">{formatBRL(item.valor)}</span> : null}
                  {item.executado ? (
                    <input
                      type="date"
                      value={item.data ?? ""}
                      onChange={(e) => updateItem(item.id, { data: e.target.value })}
                      className="border border-line bg-cream rounded-lg px-2 py-1 text-[13px] outline-none focus:border-orange"
                    />
                  ) : null}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Salvando…" : "Salvar e ir para Acompanhar →"}
        </Button>
        <AutosaveIndicator status={autosaveStatus} />
      </div>
    </form>
  );
}
