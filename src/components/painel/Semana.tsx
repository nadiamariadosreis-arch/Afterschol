"use client";

import { useState } from "react";
import { addDays, addWeeks, format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AREAS, AREA_BY_ID, type AreaId } from "@/lib/painel/data";
import { addTarefa, update, useNow, usePainel, weekDays, ymd } from "@/lib/painel/store";
import { AddInput, Card, Check, Eyebrow, Heading, XButton } from "./ui";

export function Semana() {
  const s = usePainel();
  const now = useNow();
  const [offset, setOffset] = useState(0);
  const [filtro, setFiltro] = useState<AreaId | null>(null);
  const [area, setArea] = useState<AreaId>("casa");

  const base = addWeeks(now, offset);
  const dias = weekDays(base);
  const datas = new Set(dias.map(ymd));
  const daSemana = s.tarefas.filter((t) => datas.has(t.date));

  const move = (id: string, delta: number) =>
    update((st) => ({
      ...st,
      tarefas: st.tarefas.map((t) => (t.id === id ? { ...t, date: ymd(addDays(parseISO(t.date), delta)) } : t)),
    }));

  return (
    <div className="space-y-6">
      <Heading sub="Distribua o labor da semana com medida. Os dias com mais de 5 tarefas acendem um alerta: a Regra prefere o que dá para cumprir.">
        A semana em Horas
      </Heading>

      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => setOffset(offset - 1)} className="w-9 h-9 rounded-full border border-line bg-white" aria-label="Semana anterior">
          ‹
        </button>
        <div className="font-semibold text-navy min-w-[190px] text-center text-[15px]">
          {format(dias[0], "d MMM", { locale: ptBR })} – {format(dias[6], "d MMM", { locale: ptBR })}
        </div>
        <button type="button" onClick={() => setOffset(offset + 1)} className="w-9 h-9 rounded-full border border-line bg-white" aria-label="Próxima semana">
          ›
        </button>
        {offset !== 0 ? (
          <button type="button" onClick={() => setOffset(0)} className="text-[13px] underline underline-offset-4 text-navy ml-2">
            Voltar para esta semana
          </button>
        ) : null}
      </div>

      {/* Balanço por área */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltro(null)}
          className={`rounded-full px-3 py-1.5 text-[13px] border ${filtro === null ? "bg-navy text-white border-navy" : "bg-white border-line"}`}
        >
          Todas
        </button>
        {AREAS.map((a) => {
          const list = daSemana.filter((t) => t.area === a.id);
          const d = list.filter((t) => t.done).length;
          const active = filtro === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setFiltro(active ? null : a.id)}
              className="rounded-full px-3 py-1.5 text-[13px] border transition-colors"
              style={{ borderColor: a.color, background: active ? a.color : "#fff", color: active ? "#fff" : a.color }}
            >
              {a.icon} {a.nome} · {d}/{list.length}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dias.map((dia, i) => {
          const key = ymd(dia);
          const tasks = daSemana.filter((t) => t.date === key && (!filtro || t.area === filtro));
          const pend = daSemana.filter((t) => t.date === key && !t.done).length;
          const domingo = i === 6;
          const hoje = isSameDay(dia, now);
          const carga = pend > 5 ? "#e2632f" : pend > 3 ? "#b08d45" : "#4a5d45";
          return (
            <Card
              key={key}
              className={`!p-4 ${domingo ? "bg-cream" : ""}`}
              style={hoje ? { boxShadow: "0 0 0 2px #b08d45" } : undefined}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-[20px] text-navy capitalize">{format(dia, "EEEE", { locale: ptBR })}</div>
                  <div className="text-[12px] text-ink/50">{format(dia, "d 'de' MMM", { locale: ptBR })}</div>
                </div>
                {hoje ? <Eyebrow className="text-gold">Hoje</Eyebrow> : null}
              </div>
              <div className="h-1.5 rounded-full bg-line/70 mt-2 overflow-hidden" title={`${pend} pendentes`}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (pend / 6) * 100)}%`, background: carga }} />
              </div>
              {pend > 5 ? <div className="text-[12px] text-flame-dark mt-1">Dia pesado: alivie.</div> : null}
              {domingo ? <div className="text-[12px] text-gold mt-1">Dia do Senhor: descanse, só o essencial.</div> : null}
              <div className="mt-2 min-h-[24px]">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center group">
                    <div className="flex-1 min-w-0">
                      <Check
                        small
                        checked={t.done}
                        color={AREA_BY_ID[t.area].color}
                        onChange={() => update((st) => ({ ...st, tarefas: st.tarefas.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))}
                        label={
                          <>
                            <span className="opacity-70">{AREA_BY_ID[t.area].icon}</span> {t.text}
                          </>
                        }
                      />
                    </div>
                    <button type="button" onClick={() => move(t.id, -1)} className="text-ink/30 hover:text-navy text-[14px] px-0.5" title="Dia anterior" aria-label="Mover para o dia anterior">
                      ←
                    </button>
                    <button type="button" onClick={() => move(t.id, 1)} className="text-ink/30 hover:text-navy text-[14px] px-0.5" title="Dia seguinte" aria-label="Mover para o dia seguinte">
                      →
                    </button>
                    <XButton onClick={() => update((st) => ({ ...st, tarefas: st.tarefas.filter((x) => x.id !== t.id) }))} />
                  </div>
                ))}
              </div>
              <AddInput className="mt-2 !flex-nowrap" placeholder="+ tarefa" buttonLabel="+" onAdd={(text) => addTarefa(text, filtro ?? area, key)} />
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[13px] text-ink/60">
        Área das novas tarefas:
        <select value={area} onChange={(e) => setArea(e.target.value as AreaId)} className="rounded-full border border-line bg-white px-3 py-1.5">
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.nome}
            </option>
          ))}
        </select>
        <span>(com um filtro ligado, usa a área do filtro)</span>
      </div>
    </div>
  );
}
