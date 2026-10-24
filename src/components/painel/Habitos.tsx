"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HABITO_GROUPS, type HabitoGroup } from "@/lib/painel/data";
import { toggleCheck, uid, update, useNow, usePainel, weekDays, ymd } from "@/lib/painel/store";
import { AddInput, Card, Eyebrow, Heading, XButton } from "./ui";

export function Habitos() {
  const s = usePainel();
  const now = useNow();
  const dias = weekDays(now);
  const today = ymd(now);
  const [novoGrupo, setNovoGrupo] = useState<HabitoGroup>("eu");

  const streak = (id: string) => {
    let n = 0;
    let d = now;
    if (!s.checks[`b:${ymd(d)}:${id}`]) d = subDays(d, 1);
    while (s.checks[`b:${ymd(d)}:${id}`] && n < 365) {
      n++;
      d = subDays(d, 1);
    }
    return n;
  };

  return (
    <div className="space-y-6">
      <Heading sub="A Regra se vive em pequenos gestos repetidos. Marque cada dia e veja a sequência crescer. O que importa é a constância, não a perfeição.">
        Hábitos: o cuidado que sustenta
      </Heading>

      {HABITO_GROUPS.map((g) => {
        const lista = s.habitos.filter((h) => h.group === g.id);
        return (
          <Card key={g.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[20px]">{g.icon}</span>
              <h3 className="font-display text-[20px] text-navy">{g.nome}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[14px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-ink/40">
                    <th />
                    {dias.map((d) => (
                      <th key={ymd(d)} className={`font-semibold pb-1 ${ymd(d) === today ? "text-navy" : ""}`}>
                        {format(d, "EEEEE", { locale: ptBR })}
                        <div className="text-[10px] font-normal">{format(d, "d")}</div>
                      </th>
                    ))}
                    <th className="pb-1">🔥</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((h) => (
                    <tr key={h.id} className="border-t border-line/60">
                      <td className="py-1.5 pr-2">{h.name}</td>
                      {dias.map((d) => {
                        const key = `b:${ymd(d)}:${h.id}`;
                        const on = !!s.checks[key];
                        return (
                          <td key={key} className="text-center">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={on}
                              aria-label={`${h.name}, ${format(d, "EEEE", { locale: ptBR })}`}
                              onClick={() => toggleCheck(key)}
                              className="w-7 h-7 rounded-full border-2 transition-colors"
                              style={{ borderColor: g.color, background: on ? g.color : "transparent" }}
                            />
                          </td>
                        );
                      })}
                      <td className="text-center font-semibold tabular-nums">{streak(h.id)}</td>
                      <td>
                        <XButton onClick={() => update((st) => ({ ...st, habitos: st.habitos.filter((x) => x.id !== h.id) }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      <Card>
        <Eyebrow className="text-ink/50">Novo hábito</Eyebrow>
        <AddInput
          className="mt-2"
          placeholder="Ex.: ler 10 min antes de dormir"
          onAdd={(text) => update((st) => ({ ...st, habitos: [...st.habitos, { id: uid(), name: text.trim(), group: novoGrupo }] }))}
        >
          <select value={novoGrupo} onChange={(e) => setNovoGrupo(e.target.value as HabitoGroup)} className="rounded-full border border-line bg-white px-3 py-2 text-[14px]" aria-label="Grupo do hábito">
            {HABITO_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.icon} {g.nome}
              </option>
            ))}
          </select>
        </AddInput>
      </Card>
    </div>
  );
}
