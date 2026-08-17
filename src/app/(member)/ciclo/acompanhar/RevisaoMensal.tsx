"use client";

import { Card } from "@/components/ui/Card";
import { formatBRL } from "@/lib/format";
import {
  margemFinanceira,
  planejadoRealizadoPorProcesso,
  rendaFuturaComprometida,
  resumoPorMotivo,
  type Envelope,
} from "@/lib/apfa/calc";
import { PROCESSO_INFO, MOTIVO_COMPRA_LABEL } from "@/lib/apfa/processos";
import type { AvaliarData, LancamentoEnvelope } from "@/lib/apfa/types";

export function RevisaoMensal({
  envelopes,
  avaliar,
  lancamentos,
}: {
  envelopes: Envelope[];
  avaliar: AvaliarData | null;
  lancamentos: LancamentoEnvelope[];
}) {
  if (envelopes.length === 0) return null;

  const categorias = planejadoRealizadoPorProcesso(envelopes);
  const totalPlanejado = categorias.reduce((sum, c) => sum + c.planejado, 0);
  const totalRealizado = categorias.reduce((sum, c) => sum + c.realizado, 0);
  const diferenca = totalRealizado - totalPlanejado;
  const margem = margemFinanceira(avaliar, envelopes);
  const futura = rendaFuturaComprometida(avaliar);
  const motivos = resumoPorMotivo(lancamentos);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Revisão do mês</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          Uma ferramenta de aprendizado, não de julgamento: o que aconteceu neste mês? Onde você
          gastou mais do que havia planejado? O que funcionou bem? O que você gostaria de ajustar no
          próximo mês?
        </p>
      </div>

      <Card>
        <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-4">Planejado × Realizado</h4>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-xl bg-cream-dark px-4 py-3.5">
            <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Planejado</p>
            <p className="text-[20px] font-semibold text-ink mt-0.5">{formatBRL(totalPlanejado)}</p>
          </div>
          <div className="rounded-xl bg-orange-light px-4 py-3.5">
            <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Realizado</p>
            <p className="text-[20px] font-semibold text-orange-dark mt-0.5">{formatBRL(totalRealizado)}</p>
          </div>
          <div className="rounded-xl bg-mint-bg px-4 py-3.5">
            <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Diferença</p>
            <p className={`text-[20px] font-semibold mt-0.5 ${diferenca > 0 ? "text-orange-dark" : "text-mint"}`}>
              {diferenca > 0 ? "+" : ""}
              {formatBRL(diferenca)}
            </p>
          </div>
        </div>
        <table className="w-full text-[14px] border-t border-line">
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.processo} className="border-b border-line">
                <td className="py-2 text-ink/75">{PROCESSO_INFO[cat.processo].titulo}</td>
                <td className="py-2 text-right text-ink/60">{formatBRL(cat.planejado)}</td>
                <td className="py-2 text-right font-semibold text-ink">{formatBRL(cat.realizado)}</td>
                <td
                  className={`py-2 text-right text-[13px] font-semibold ${cat.diferenca > 0 ? "text-orange-dark" : "text-ink/50"}`}
                >
                  {cat.diferenca > 0 ? "acima do planejado" : cat.diferenca < 0 ? "abaixo do planejado" : "em linha"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card>
          <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Sua margem financeira</h4>
          <p className="text-ink/55 text-[13px] mb-3">Renda menos as despesas e compromissos planejados para o mês.</p>
          <p className={`text-[26px] font-semibold ${margem >= 0 ? "text-sage" : "text-orange-dark"}`}>
            {formatBRL(margem)}
          </p>
        </Card>

        <Card>
          <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Renda futura comprometida</h4>
          <p className="text-ink/55 text-[13px] mb-3">
            Parcelas já assumidas ({formatBRL(futura.parcelas)}) sobre a renda mensal ({formatBRL(futura.renda)}).
          </p>
          <p className="text-[26px] font-semibold text-ink">{futura.percentual.toFixed(0)}%</p>
          <p className="text-ink/50 text-[12px] mt-1">da sua renda futura já está comprometida.</p>
        </Card>
      </div>

      {motivos.length ? (
        <Card>
          <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Por que você gastou</h4>
          <p className="text-ink/55 text-[13px] mb-4">
            Um retrato dos motivos que você registrou junto com os gastos do mês — pra perceber
            padrões, não pra julgar.
          </p>
          <div className="flex flex-col gap-2">
            {motivos.map((m) => (
              <div key={m.motivo} className="flex items-center justify-between text-[14px]">
                <span className="text-ink/75">
                  {MOTIVO_COMPRA_LABEL[m.motivo]}
                  <span className="text-ink/45"> · {m.quantidade} compra{m.quantidade === 1 ? "" : "s"}</span>
                </span>
                <span className="font-semibold text-ink">{formatBRL(m.valor)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
