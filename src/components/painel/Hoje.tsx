"use client";

import { useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AREAS, AREA_BY_ID, HORAS, LECTIO, type AreaId } from "@/lib/painel/data";
import { addTarefa, toggleCheck, uid, update, useNow, usePainel, ymd } from "@/lib/painel/store";
import { AddInput, Card, Check, Eyebrow, Ring, XButton } from "./ui";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function polar(cx: number, cy: number, r: number, min: number) {
  const a = (min / 1440) * 2 * Math.PI - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const span = to - from;
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${span > 720 ? 1 : 0} 1 ${x2} ${y2}`;
}

export function Hoje() {
  const s = usePainel();
  const now = useNow();
  const today = ymd(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [selected, setSelected] = useState<string | null>(null);
  const [lectioShift, setLectioShift] = useState(0);
  const [area, setArea] = useState<AreaId>("casa");

  const doy = differenceInCalendarDays(now, new Date(now.getFullYear(), 0, 0));
  const lectio = LECTIO[(doy + lectioShift) % LECTIO.length];

  // Horas ordenadas pelo horário (editável pela usuária)
  const horas = HORAS.map((h) => ({ ...h, st: s.horas[h.id] })).sort((a, b) => toMin(a.st.time) - toMin(b.st.time));
  const currentIdx = (() => {
    let idx = horas.length - 1;
    horas.forEach((h, i) => {
      if (toMin(h.st.time) <= nowMin) idx = i;
    });
    return idx;
  })();
  const current = horas[currentIdx];
  const open = selected ?? current.id;

  const tarefasHoje = s.tarefas.filter((t) => t.date === today);
  const pendentes = tarefasHoje.filter((t) => !t.done).length;
  const horaTotal = horas.reduce((n, h) => n + h.st.tasks.length, 0);
  const horaDone = horas.reduce((n, h) => n + h.st.tasks.filter((t) => s.checks[`h:${today}:${t.id}`]).length, 0);
  const total = horaTotal + tarefasHoje.length;
  const done = horaDone + tarefasHoje.filter((t) => t.done).length;
  const pct = total ? done / total : 0;

  const saudacao = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const domingo = now.getDay() === 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do dia */}
      <div className="rounded-3xl bg-navy text-white p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-gold/15" aria-hidden />
        <div className="relative">
          <Eyebrow className="text-gold">{format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}</Eyebrow>
          <h1 className="font-display text-[30px] md:text-[38px] leading-tight mt-1">{saudacao}, mãe.</h1>
          <p className="text-white/75 mt-2 max-w-xl text-[15.5px]">
            {domingo
              ? "Hoje é o dia do Senhor e do descanso. A Regra pede só o essencial: Missa, mesa e casa em paz."
              : `Agora é a hora de ${current.nome}: ${current.lema.toLowerCase()}.`}
          </p>
        </div>
        <div className="relative flex items-center gap-4">
          <Ring value={pct} size={110} stroke={10}>
            <div className="text-center">
              <div className="font-display text-[26px] leading-none">{Math.round(pct * 100)}%</div>
              <div className="text-[10px] tracking-widest uppercase text-white/60 mt-1">do dia</div>
            </div>
          </Ring>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
        {/* Relógio das Horas */}
        <Card className="self-start">
          <Eyebrow className="text-flame">O relógio das Horas</Eyebrow>
          <p className="text-ink/60 text-[13.5px] mt-1">Toque em uma Hora para ver o que ela pede.</p>
          <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto mt-2">
            <circle cx="150" cy="150" r="118" fill="none" stroke="#eee" strokeWidth="1" />
            {horas.map((h, i) => {
              const start = toMin(h.st.time);
              const next = toMin(horas[(i + 1) % horas.length].st.time);
              const end = next > start ? next : next + 1440;
              const active = i === currentIdx;
              return (
                <path
                  key={h.id}
                  d={arc(150, 150, 110, start + 6, end - 6)}
                  fill="none"
                  stroke={h.accent}
                  strokeWidth={active ? 22 : 14}
                  strokeLinecap="round"
                  opacity={active ? 1 : 0.4}
                  style={{ cursor: "pointer", transition: "all .3s" }}
                  onClick={() => setSelected(h.id)}
                />
              );
            })}
            {horas.map((h) => {
              const [x, y] = polar(150, 150, 110, toMin(h.st.time));
              return (
                <g key={h.id} onClick={() => setSelected(h.id)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r="14" fill="#fff" stroke={h.accent} strokeWidth="2" />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14">
                    {h.icon}
                  </text>
                </g>
              );
            })}
            {(() => {
              const [x, y] = polar(150, 150, 84, nowMin);
              return <line x1="150" y1="150" x2={x} y2={y} stroke="#201f1c" strokeWidth="3" strokeLinecap="round" />;
            })()}
            <circle cx="150" cy="150" r="5" fill="#201f1c" />
          </svg>
          <div className="text-center -mt-1">
            <div className="font-display text-[20px]" style={{ color: current.accent }}>{current.nome}</div>
            <div className="text-[13px] text-ink/50 tabular-nums">agora são {format(now, "HH:mm")}</div>
          </div>
        </Card>

        {/* Lectio do dia */}
        <Card className="self-start bg-cream border-gold/40">
          <Eyebrow className="text-gold">Lectio do dia · Regra de São Bento</Eyebrow>
          <blockquote className="font-display text-[22px] md:text-[26px] text-navy leading-snug mt-2">
            “{lectio.texto}”
          </blockquote>
          <div className="text-ink/50 text-[13px] mt-1">{lectio.ref} · paráfrase</div>
          <p className="mt-3 text-ink/80 text-[15px]">{lectio.reflexao}</p>
          <p className="mt-2 text-[15px]">
            <span className="font-semibold text-moss">Prática de hoje: </span>
            {lectio.pratica}
          </p>
          <button
            type="button"
            onClick={() => setLectioShift((n) => n + 1)}
            className="mt-3 text-[13px] font-semibold text-navy underline underline-offset-4"
          >
            Ver outra reflexão
          </button>
        </Card>
      </div>

      {/* Tarefas de hoje */}
      <Card>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Eyebrow className="text-moss">Labor de hoje</Eyebrow>
            <h2 className="font-display text-[24px] text-navy">O que é seu para fazer hoje</h2>
          </div>
          <div className="text-[13px] text-ink/60">{pendentes} pendentes</div>
        </div>
        {pendentes > 5 ? (
          <div className="mt-3 rounded-xl bg-flame/10 text-flame-dark border border-flame/30 px-4 py-3 text-[14px]">
            <b>Discrição:</b> há {pendentes} tarefas para hoje. A Regra pede medida: escolha até 3 essenciais e mande o resto
            para outro dia (veja a aba Semana).
          </div>
        ) : null}
        <div className="mt-3 divide-y divide-line/60">
          {tarefasHoje.length === 0 ? (
            <p className="text-ink/50 text-[14px] py-2">Nada marcado para hoje. Que tal definir os 3 essenciais?</p>
          ) : null}
          {tarefasHoje.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Check
                  checked={t.done}
                  color={AREA_BY_ID[t.area].color}
                  onChange={() =>
                    update((st) => ({ ...st, tarefas: st.tarefas.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))
                  }
                  label={
                    <>
                      {t.text} <span className="opacity-60">{AREA_BY_ID[t.area].icon}</span>
                    </>
                  }
                />
              </div>
              <XButton onClick={() => update((st) => ({ ...st, tarefas: st.tarefas.filter((x) => x.id !== t.id) }))} />
            </div>
          ))}
        </div>
        <AddInput className="mt-3" placeholder="Nova tarefa de hoje…" onAdd={(text) => addTarefa(text, area, today)}>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value as AreaId)}
            className="rounded-full border border-line bg-white px-3 py-2 text-[14px]"
            aria-label="Área da tarefa"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.nome}
              </option>
            ))}
          </select>
        </AddInput>
      </Card>

      {/* As Horas */}
      <div>
        <Eyebrow className="text-navy mb-3">O Horarium do seu dia</Eyebrow>
        <div className="space-y-3">
          {horas.map((h, i) => {
            const isOpen = open === h.id;
            const doneN = h.st.tasks.filter((t) => s.checks[`h:${today}:${t.id}`]).length;
            return (
              <div
                key={h.id}
                id={`hora-${h.id}`}
                className="bg-card border rounded-2xl overflow-hidden transition-shadow"
                style={{ borderColor: i === currentIdx ? h.accent : "var(--color-line)", boxShadow: i === currentIdx ? `0 0 0 2px ${h.accent}22` : undefined }}
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setSelected(isOpen ? "" : h.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                    aria-expanded={isOpen}
                  >
                    <span className="w-11 h-11 rounded-full grid place-items-center text-[20px] shrink-0" style={{ background: `${h.accent}1f` }}>
                      {h.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-[19px] text-navy">{h.nome}</span>
                        {i === currentIdx ? (
                          <span className="text-[10px] tracking-widest uppercase font-bold text-white px-2 py-0.5 rounded-full" style={{ background: h.accent }}>
                            Agora
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-[13.5px] text-ink/60 truncate">{h.lema}</span>
                    </span>
                  </button>
                  <span className="text-[12px] text-ink/50 tabular-nums hidden sm:block">
                    {doneN}/{h.st.tasks.length}
                  </span>
                  <input
                    type="time"
                    value={h.st.time}
                    onChange={(e) => update((st) => ({ ...st, horas: { ...st.horas, [h.id]: { ...st.horas[h.id], time: e.target.value || h.st.time } } }))}
                    className="rounded-lg border border-line px-2 py-1 text-[14px] tabular-nums bg-white"
                    aria-label={`Horário de ${h.nome}`}
                  />
                </div>
                {isOpen ? (
                  <div className="px-4 pb-4 pl-[72px] -mt-1">
                    <p className="text-[14px] text-ink/70 mb-2">{h.desc}</p>
                    <div className="text-[11px] text-ink/40 mb-1">Regra de São Bento · {h.ref}</div>
                    {h.st.tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-1">
                        <div className="flex-1">
                          <Check
                            checked={!!s.checks[`h:${today}:${t.id}`]}
                            onChange={() => toggleCheck(`h:${today}:${t.id}`)}
                            color={h.accent}
                            label={t.text}
                          />
                        </div>
                        <XButton
                          onClick={() =>
                            update((st) => ({
                              ...st,
                              horas: { ...st.horas, [h.id]: { ...st.horas[h.id], tasks: st.horas[h.id].tasks.filter((x) => x.id !== t.id) } },
                            }))
                          }
                        />
                      </div>
                    ))}
                    <AddInput
                      className="mt-2"
                      placeholder="Adicionar ao seu horário…"
                      buttonLabel="+"
                      onAdd={(text) =>
                        update((st) => ({
                          ...st,
                          horas: {
                            ...st.horas,
                            [h.id]: { ...st.horas[h.id], tasks: [...st.horas[h.id].tasks, { id: uid(), text: text.trim() }] },
                          },
                        }))
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
