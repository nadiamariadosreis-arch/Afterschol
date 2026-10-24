"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AREAS, type AreaId, type Review } from "@/lib/painel/data";
import { addTarefa, update, useNow, usePainel, weekStartOf, ymd } from "@/lib/painel/store";
import { Card, Eyebrow, Heading } from "./ui";

const CX = 170;
const CY = 170;
const R = 110;

const pt = (i: number, v: number) => {
  const a = (-90 + (i * 360) / AREAS.length) * (Math.PI / 180);
  return [CX + R * (v / 10) * Math.cos(a), CY + R * (v / 10) * Math.sin(a)] as const;
};

const EMPTY: Review = { intencao: "", gratidao: "", ajustar: "" };

export function Capitulo() {
  const s = usePainel();
  const now = useNow();
  const week = ymd(weekStartOf(now));
  const review = s.reviews[week] ?? EMPTY;

  const pontos = AREAS.map((a, i) => pt(i, s.roda[a.id]).join(",")).join(" ");
  const menor = AREAS.reduce((m, a) => (s.roda[a.id] < s.roda[m.id] ? a : m), AREAS[0]);

  const setReview = (patch: Partial<Review>) =>
    update((st) => ({ ...st, reviews: { ...st.reviews, [week]: { ...(st.reviews[week] ?? EMPTY), ...patch } } }));

  return (
    <div className="space-y-6">
      <Heading sub="Nos mosteiros, a comunidade se reunia em Capítulo para olhar a própria vida com verdade. Uma vez por semana, olhe sua roda, agradeça e ajuste com humildade.">
        O Capítulo da semana
      </Heading>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <Eyebrow className="text-gold">Roda da vida · {AREAS.length} ofícios</Eyebrow>
          <svg viewBox="0 25 340 290" className="w-full max-w-[380px] mx-auto">
            {[2, 4, 6, 8, 10].map((lv) => (
              <polygon
                key={lv}
                points={AREAS.map((_, i) => pt(i, lv).join(",")).join(" ")}
                fill="none"
                stroke="#e2e2e2"
              />
            ))}
            {AREAS.map((a, i) => {
              const [x, y] = pt(i, 10);
              const [lx, ly] = pt(i, 12.6);
              return (
                <g key={a.id}>
                  <line x1={CX} y1={CY} x2={x} y2={y} stroke="#e2e2e2" />
                  <text x={lx} y={ly + 6} textAnchor="middle" fontSize="18">
                    {a.icon}
                  </text>
                </g>
              );
            })}
            <polygon points={pontos} fill="#b08d45" fillOpacity="0.25" stroke="#b08d45" strokeWidth="2.5" strokeLinejoin="round" style={{ transition: "all .3s" }} />
            {AREAS.map((a, i) => {
              const [x, y] = pt(i, s.roda[a.id]);
              return <circle key={a.id} cx={x} cy={y} r="5" fill={a.color} stroke="#fff" strokeWidth="2" />;
            })}
          </svg>
        </Card>

        <Card>
          <Eyebrow className="text-ink/50">Como estou em cada área? (0 a 10)</Eyebrow>
          <div className="mt-3 space-y-2.5">
            {AREAS.map((a) => (
              <div key={a.id}>
                <label className="flex items-center gap-3 text-[14px]">
                  <span className="w-[140px] shrink-0">
                    {a.icon} {a.nome}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={s.roda[a.id]}
                    onChange={(e) => update((st) => ({ ...st, roda: { ...st.roda, [a.id]: Number(e.target.value) } }))}
                    className="flex-1"
                    style={{ accentColor: a.color }}
                  />
                  <span className="w-5 text-right tabular-nums font-semibold">{s.roda[a.id]}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-cream border border-gold/40 p-4">
            <div className="text-[12px] uppercase tracking-widest text-gold font-semibold">Onde pedir ajuda esta semana</div>
            <p className="mt-1 text-[15px]">
              {menor.icon} <b>{menor.nome}</b> está com {s.roda[menor.id]}. <span className="text-ink/60">{menor.principio}.</span>
            </p>
            <p className="text-[13px] text-ink/60 mt-1">Escolha UMA pequena ação, não cinco:</p>
            <div className="flex flex-col gap-1.5 mt-2">
              {menor.acoes.map((acao) => (
                <button
                  key={acao}
                  type="button"
                  onClick={() => addTarefa(acao, menor.id as AreaId, ymd(now))}
                  className="text-left text-[14px] rounded-lg border border-line bg-white px-3 py-2 hover:border-navy transition-colors"
                >
                  + {acao} <span className="text-ink/40 text-[12px]">(adicionar a hoje)</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Eyebrow className="text-moss">
          Semana de {format(weekStartOf(now), "d 'de' MMMM", { locale: ptBR })}
        </Eyebrow>
        <div className="grid md:grid-cols-3 gap-4 mt-3">
          {(
            [
              ["intencao", "Minha intenção da semana", "O que quero oferecer a Deus nesta semana?"],
              ["gratidao", "Do que sou grata", "Três coisas boas que vi nesta semana…"],
              ["ajustar", "O que vou ajustar", "O que pesou? O que cortar ou simplificar?"],
            ] as const
          ).map(([k, t, ph]) => (
            <label key={k} className="block">
              <span className="block text-[14px] font-semibold text-navy mb-1">{t}</span>
              <textarea
                rows={5}
                value={review[k]}
                onChange={(e) => setReview({ [k]: e.target.value })}
                placeholder={ph}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[14.5px] outline-none focus:border-navy resize-y"
              />
            </label>
          ))}
        </div>
        <p className="text-[12.5px] text-ink/40 mt-2">Salvo automaticamente neste aparelho.</p>
      </Card>
    </div>
  );
}
