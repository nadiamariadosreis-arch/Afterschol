"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MICRO_DIARIO, ZONAS } from "@/lib/painel/data";
import { toggleCheck, uid, update, useNow, usePainel, weekDays, ymd } from "@/lib/painel/store";
import { AddInput, Card, Check, Eyebrow, Heading, XButton } from "./ui";

export function Casa() {
  const s = usePainel();
  const now = useNow();
  const today = ymd(now);
  const dias = weekDays(now);
  const COLOR = "#4a5d45";

  return (
    <div className="space-y-6">
      <Heading sub="São Bento chamava a responsável pela casa de despenseira e pedia que tratasse cada utensílio como vaso sagrado do altar (RB 31). Uma zona por dia, sem sobrecarga.">
        A casa em ordem, sem pressa
      </Heading>

      <Card>
        <Eyebrow className="text-moss">Todo dia · 15 minutos</Eyebrow>
        <div className="grid sm:grid-cols-2 gap-x-6 mt-2">
          {MICRO_DIARIO.map((t) => (
            <Check key={t} color={COLOR} checked={!!s.checks[`m:${today}:${t}`]} onChange={() => toggleCheck(`m:${today}:${t}`)} label={t} />
          ))}
        </div>
      </Card>

      <div>
        <Eyebrow className="text-navy mb-3">Rodízio das zonas · uma por dia</Eyebrow>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {dias.map((dia, i) => {
            const key = ymd(dia);
            const z = ZONAS[i];
            const done = z.tasks.filter((_, j) => s.checks[`z:${key}:${j}`]).length;
            const hoje = key === today;
            return (
              <Card key={key} className={`!p-4 ${i === 6 ? "bg-cream" : ""}`} style={hoje ? { boxShadow: `0 0 0 2px ${COLOR}` } : undefined}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] uppercase tracking-widest text-ink/50">{format(dia, "EEE", { locale: ptBR })}</span>
                  <span className="text-[12px] text-ink/50">
                    {done}/{z.tasks.length}
                  </span>
                </div>
                <div className="font-display text-[18px] text-navy mt-0.5">
                  {z.icon} {z.nome}
                </div>
                <div className="mt-2">
                  {z.tasks.map((t, j) => (
                    <Check small key={j} color={COLOR} checked={!!s.checks[`z:${key}:${j}`]} onChange={() => toggleCheck(`z:${key}:${j}`)} label={t} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <Eyebrow className="text-flame">Cardápio da semana</Eyebrow>
        <p className="text-ink/60 text-[13.5px] mt-1 mb-3">Decidir antes tira a pergunta “o que vamos comer?” do fim do dia.</p>
        <div className="overflow-x-auto">
          <div className="min-w-[560px] grid grid-cols-[90px_1fr_1fr] gap-2 items-center">
            <div />
            <div className="text-[12px] uppercase tracking-widest text-ink/50">Almoço</div>
            <div className="text-[12px] uppercase tracking-widest text-ink/50">Jantar</div>
            {dias.map((dia) => {
              const key = ymd(dia);
              return (
                <div key={key} className="contents">
                  <div className="text-[14px] font-semibold text-navy capitalize">{format(dia, "EEE d", { locale: ptBR })}</div>
                  {(["almoco", "jantar"] as const).map((r) => (
                    <input
                      key={r}
                      value={s.refeicoes[`${key}:${r}`] ?? ""}
                      onChange={(e) => update((st) => ({ ...st, refeicoes: { ...st.refeicoes, [`${key}:${r}`]: e.target.value } }))}
                      placeholder="—"
                      className="rounded-lg border border-line bg-white px-3 py-1.5 text-[14px] outline-none focus:border-navy"
                      aria-label={`${r} de ${format(dia, "EEEE", { locale: ptBR })}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <Eyebrow className="text-terracotta">Lista de compras</Eyebrow>
        <div className="mt-2">
          {s.compras.length === 0 ? <p className="text-ink/50 text-[14px]">Lista vazia.</p> : null}
          {s.compras.map((c) => (
            <div key={c.id} className="flex items-center">
              <div className="flex-1">
                <Check
                  small
                  color="#a4644c"
                  checked={c.done}
                  onChange={() => update((st) => ({ ...st, compras: st.compras.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) }))}
                  label={c.text}
                />
              </div>
              <XButton onClick={() => update((st) => ({ ...st, compras: st.compras.filter((x) => x.id !== c.id) }))} />
            </div>
          ))}
        </div>
        <AddInput
          className="mt-3"
          placeholder="Adicionar item…"
          onAdd={(text) => update((st) => ({ ...st, compras: [...st.compras, { id: uid(), text: text.trim(), done: false }] }))}
        />
        {s.compras.some((c) => c.done) ? (
          <button
            type="button"
            onClick={() => update((st) => ({ ...st, compras: st.compras.filter((c) => !c.done) }))}
            className="mt-3 text-[13px] underline underline-offset-4 text-navy"
          >
            Limpar itens comprados
          </button>
        ) : null}
      </Card>
    </div>
  );
}
