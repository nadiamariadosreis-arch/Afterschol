"use client";

import { IG_STATUS } from "@/lib/painel/data";
import { uid, update, useNow, usePainel, weekDays, ymd } from "@/lib/painel/store";
import { AddInput, Card, Eyebrow, Heading, Ring, XButton } from "./ui";

const COLOR = "#3d7f8c";

const REGRAS = [
  ["Labor com hora marcada", "O Instagram tem horário (ex.: 30 min nas Completas, seg/qua/sex) e hora de fechar. “A ociosidade é inimiga da alma” (RB 48): rolar o feed sem fim também é ociosidade."],
  ["Um dia de lote", "Escolha um bloco na semana para roteirizar e gravar vários posts de uma vez. Menos troca de tarefa, mais paz."],
  ["Hospitalidade nos comentários", "“Todos os hóspedes sejam recebidos como Cristo” (RB 53): responda com atenção e carinho, no seu horário, sem pressa e sem culpa."],
  ["Domingo sem postar", "O dia do Senhor é de descanso. Programe tudo antes e deixe o celular em paz."],
  ["Medida acima de volume", "Poucos posts bem feitos valem mais que muitos feitos às pressas. Discrição é a mãe das virtudes (RB 64)."],
];

export function Instagram() {
  const s = usePainel();
  const now = useNow();
  const dias = weekDays(now).map(ymd);
  const postadosSemana = s.ideias.filter((i) => i.status === 3 && i.postedAt && dias.includes(i.postedAt)).length;
  const pct = Math.min(1, postadosSemana / Math.max(1, s.igMeta));

  const setStatus = (id: string, delta: number) =>
    update((st) => ({
      ...st,
      ideias: st.ideias.map((i) => {
        if (i.id !== id) return i;
        const status = Math.max(0, Math.min(3, i.status + delta)) as 0 | 1 | 2 | 3;
        return { ...i, status, postedAt: status === 3 ? ymd(now) : undefined };
      }),
    }));

  return (
    <div className="space-y-6">
      <Heading sub="Seu trabalho no Instagram como um ofício que cabe na sua vida, não um segundo emprego que a devora.">
        Instagram: o labor criativo
      </Heading>

      <div className="grid md:grid-cols-[auto_1fr] gap-6">
        <Card className="flex items-center gap-5">
          <Ring value={pct} size={120} stroke={11} color={COLOR} track="#e8eef0">
            <div className="text-center">
              <div className="font-display text-[30px] text-navy leading-none">
                {postadosSemana}
                <span className="text-ink/40 text-[18px]">/{s.igMeta}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-ink/50 mt-1">posts</div>
            </div>
          </Ring>
          <div>
            <Eyebrow className="text-ink/50">
              Meta da semana
            </Eyebrow>
            <div className="flex items-center gap-2 mt-2">
              <button type="button" aria-label="Diminuir meta" onClick={() => update((st) => ({ ...st, igMeta: Math.max(1, st.igMeta - 1) }))} className="w-9 h-9 rounded-full border border-line bg-white text-[18px]">
                −
              </button>
              <span className="w-8 text-center font-semibold">{s.igMeta}</span>
              <button type="button" aria-label="Aumentar meta" onClick={() => update((st) => ({ ...st, igMeta: Math.min(14, st.igMeta + 1) }))} className="w-9 h-9 rounded-full border border-line bg-white text-[18px]">
                +
              </button>
            </div>
            <p className="text-[12.5px] text-ink/50 mt-2 max-w-[200px]">
              {postadosSemana >= s.igMeta ? "Meta cumprida. Descanse com a consciência em paz." : "Escolha uma meta que cumpra sem culpa."}
            </p>
          </div>
        </Card>

        <Card>
          <Eyebrow className="text-gold">Regras de ouro do labor digital</Eyebrow>
          <ul className="mt-2 space-y-2.5">
            {REGRAS.map(([t, d]) => (
              <li key={t} className="text-[14.5px]">
                <b className="text-navy">{t}.</b> <span className="text-ink/70">{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <Eyebrow className="text-ink/50">Quadro de conteúdo</Eyebrow>
        <AddInput className="mt-3" placeholder="Nova ideia de post…" onAdd={(text) => update((st) => ({ ...st, ideias: [{ id: uid(), text: text.trim(), status: 0 }, ...st.ideias] }))} />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          {IG_STATUS.map((nome, col) => {
            const itens = s.ideias.filter((i) => i.status === col);
            return (
              <div key={nome} className="rounded-xl bg-cream/70 p-3 min-h-[120px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] uppercase tracking-widest font-semibold" style={{ color: COLOR }}>
                    {nome}
                  </span>
                  <span className="text-[12px] text-ink/40">{itens.length}</span>
                </div>
                <div className="space-y-2">
                  {itens.map((i) => (
                    <div key={i.id} className="bg-white border border-line rounded-lg p-2.5 text-[14px]">
                      <div className="flex items-start gap-1">
                        <span className="flex-1 leading-snug">{i.text}</span>
                        <XButton onClick={() => update((st) => ({ ...st, ideias: st.ideias.filter((x) => x.id !== i.id) }))} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <button type="button" disabled={col === 0} onClick={() => setStatus(i.id, -1)} className="text-[12px] text-ink/50 disabled:opacity-20 hover:text-navy">
                          ← voltar
                        </button>
                        <button type="button" disabled={col === 3} onClick={() => setStatus(i.id, 1)} className="text-[12px] font-semibold disabled:opacity-20" style={{ color: COLOR }}>
                          avançar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
