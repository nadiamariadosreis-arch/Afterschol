import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCycleById } from "@/lib/apfa/ciclo";
import { comparativo, cycleLabel } from "@/lib/apfa/calc";
import { PROCESSO_INFO, MEIO_PAGAMENTO_LABEL, URGENCIA_LABEL } from "@/lib/apfa/processos";
import { formatBRL } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { PrintButton } from "@/components/member/PrintButton";

export default async function PlannerPage({ params }: { params: Promise<{ cicloId: string }> }) {
  const { cicloId } = await params;
  const profile = await requireMember();
  const supabase = await createClient();
  const cycle = await getCycleById(supabase, profile.id, cicloId);
  if (!cycle) notFound();

  const linhas = comparativo(cycle.percentuais, cycle.avaliar);
  const dividas = [...(cycle.planejar?.dividas ?? [])].sort((a, b) => Number(b.dolorosa) - Number(a.dolorosa));

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-2">
            Planner · {profile.family_name || "Sua família"}
          </div>
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">
            {cycleLabel(cycle.year, cycle.month)}
          </h1>
        </div>
        <PrintButton />
      </div>

      <Card>
        <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Comparativo — Ideal × Real</h2>
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-ink/50 text-[12px] uppercase tracking-wide">
              <th className="pb-2">Processo</th>
              <th className="pb-2">Ideal</th>
              <th className="pb-2">Real</th>
              <th className="pb-2">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.processo} className="border-t border-line">
                <td className="py-2 font-semibold">{PROCESSO_INFO[l.processo].titulo}</td>
                <td className="py-2">
                  {l.idealPct}% ({formatBRL(l.idealValor)})
                </td>
                <td className="py-2">
                  {l.realPct.toFixed(0)}% ({formatBRL(l.realValor)})
                </td>
                <td className={`py-2 font-semibold ${l.diferencaPct > 3 ? "text-orange-dark" : "text-sage"}`}>
                  {l.diferencaPct > 0 ? "+" : ""}
                  {l.diferencaPct.toFixed(0)}pp
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {dividas.length ? (
        <Card>
          <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Plano de ação — Dívidas</h2>
          <div className="flex flex-col gap-3">
            {dividas.map((d) => (
              <div key={d.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <p className="font-semibold text-[15px]">
                  {d.nome} {d.dolorosa ? <span className="text-orange-dark text-[12px] font-bold uppercase ml-1">Prioridade emocional</span> : null}
                </p>
                <p className="text-ink/60 text-[13px]">
                  {formatBRL(d.valor)} · urgência {URGENCIA_LABEL[d.urgencia]}
                  {d.juros ? ` · juros ${d.juros}% a.m.` : ""} · sai de: {d.origem_pagamento || "a definir"}
                  {d.quitada ? " · quitada" : ""}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {cycle.planejar?.organizacao_mes.length ? (
        <Card>
          <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Organização do mês</h2>
          <div className="flex flex-col gap-2">
            {cycle.planejar.organizacao_mes.map((item) => (
              <div key={item.id} className="flex justify-between text-[14px] border-t border-line pt-2 first:border-t-0 first:pt-0">
                <span>
                  {item.nome} {item.cortar ? <span className="text-orange-dark text-[12px]">(cortar)</span> : null}
                </span>
                <span className="text-ink/60">
                  dia {item.dia_pagamento ?? "?"} · {MEIO_PAGAMENTO_LABEL[item.meio_pagamento]} · {item.quem_paga || "—"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {cycle.planejar?.cartao.cartoes.length ? (
        <Card>
          <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Cartão de crédito</h2>
          <div className="flex flex-col gap-3">
            {cycle.planejar.cartao.cartoes.map((c) => (
              <div key={c.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <p className="font-semibold text-[15px]">
                  {c.nome} — {formatBRL(c.valor_ultima_fatura)}
                </p>
                {c.avaliacao ? <p className="text-ink/60 text-[13px] mt-1">{c.avaliacao}</p> : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {cycle.fazer_acontecer?.itens.length ? (
        <Card>
          <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Execução</h2>
          <p className="text-ink/70 text-[14px] mb-2">
            Reserva: {cycle.fazer_acontecer.reserva.guardado ? "separada ✓" : "ainda não separada"}
            {cycle.fazer_acontecer.reserva.conta_destino ? ` · ${cycle.fazer_acontecer.reserva.conta_destino}` : ""}
          </p>
          <div className="flex flex-col gap-1.5">
            {cycle.fazer_acontecer.itens.map((item) => (
              <p key={item.id} className="text-[14px]">
                {item.executado ? "✓" : "○"} {item.descricao}
              </p>
            ))}
          </div>
        </Card>
      ) : null}

      {cycle.acompanhar?.completed_at ? (
        <Card>
          <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Diagnóstico do mês</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(cycle.acompanhar.por_processo).map(([key, d]) =>
              d.deu_certo || d.nao_deu_certo ? (
                <div key={key} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <p className="font-semibold text-[15px]">{PROCESSO_INFO[key as keyof typeof PROCESSO_INFO].titulo}</p>
                  {d.deu_certo ? <p className="text-[14px] text-sage">Deu certo: {d.deu_certo}</p> : null}
                  {d.nao_deu_certo ? <p className="text-[14px] text-orange-dark">Não deu certo: {d.nao_deu_certo}</p> : null}
                  {d.mudanca ? <p className="text-[14px] text-ink/70">Mudança: {d.mudanca}</p> : null}
                </div>
              ) : null,
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
