"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatBRL } from "@/lib/format";
import { resumoPorCategoria, resumoPorPessoaAvaliar, type ComparativoLinha } from "@/lib/apfa/calc";
import { PROCESSO_INFO } from "@/lib/apfa/processos";
import type { AvaliarData } from "@/lib/apfa/types";

export function ResumoFinal({
  avaliar,
  linhas,
  cicloLabel,
}: {
  avaliar: AvaliarData;
  linhas: ComparativoLinha[];
  cicloLabel: string;
}) {
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const entra = avaliar.renda_mensal;
  const categorias = resumoPorCategoria(avaliar);
  const sai = categorias.reduce((sum, c) => sum + c.valor, 0);
  const saldo = entra - sai;
  const maiorBarra = Math.max(entra, sai, 1);
  const porPessoa = resumoPorPessoaAvaliar(avaliar);

  async function baixarPdf() {
    setGerandoPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Método A.P.F.A — Resumo do Avaliar", 14, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(cicloLabel, 14, y);
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Quanto entra x quanto sai", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Entra (renda mensal): ${formatBRL(entra)}`, 14, y);
      y += 6;
      doc.text(`Sai (total de gastos): ${formatBRL(sai)}`, 14, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text(`Saldo: ${formatBRL(saldo)}`, 14, y);
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Total por categoria", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const cat of categorias) {
        doc.text(cat.nome, 14, y);
        doc.text(formatBRL(cat.valor), 196, y, { align: "right" });
        y += 6;
      }
      y += 6;

      if (porPessoa.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Por pessoa", 14, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        for (const grupo of porPessoa) {
          doc.setFont("helvetica", "bold");
          doc.text(grupo.pessoa, 14, y);
          doc.text(formatBRL(grupo.total), 196, y, { align: "right" });
          y += 6;
          doc.setFont("helvetica", "normal");
          for (const item of grupo.itens) {
            doc.text(`  ${item.nome}`, 14, y);
            doc.text(formatBRL(item.valor), 196, y, { align: "right" });
            y += 6;
          }
        }
        y += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Diagnóstico — Ideal x Real", 14, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const linha of linhas) {
        doc.text(
          `${PROCESSO_INFO[linha.processo].titulo}: ideal ${linha.idealPct}% (${formatBRL(linha.idealValor)}) · real ${linha.realPct.toFixed(0)}% (${formatBRL(linha.realValor)})`,
          14,
          y,
        );
        y += 6;
      }

      doc.save(`resumo-avaliar-${cicloLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } finally {
      setGerandoPdf(false);
    }
  }

  return (
    <Card>
      <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Resumo final</h3>
      <p className="text-ink/60 text-[14px] mb-5">
        Sem detalhar item por item — só o quanto entra, o quanto sai e o saldo do mês, junto com o
        total de cada grupo que você preencheu acima.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-mint-bg px-4 py-3.5">
          <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Entra</p>
          <p className="text-[20px] font-semibold text-mint mt-0.5">{formatBRL(entra)}</p>
        </div>
        <div className="rounded-xl bg-orange-light px-4 py-3.5">
          <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Sai</p>
          <p className="text-[20px] font-semibold text-orange-dark mt-0.5">{formatBRL(sai)}</p>
        </div>
        <div className="rounded-xl bg-cream-dark px-4 py-3.5">
          <p className="text-[12px] font-semibold text-ink/60 uppercase tracking-wide">Saldo</p>
          <p className={`text-[20px] font-semibold mt-0.5 ${saldo >= 0 ? "text-mint" : "text-orange-dark"}`}>
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        <BarraComparativa label="Entra" valor={entra} max={maiorBarra} cor="bg-mint" />
        <BarraComparativa label="Sai" valor={sai} max={maiorBarra} cor="bg-orange-dark" />
      </div>

      <table className="w-full text-[14px] mb-6 border-t border-line">
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.nome} className="border-b border-line">
              <td className="py-2 text-ink/75">{cat.nome}</td>
              <td className="py-2 text-right font-semibold text-ink">{formatBRL(cat.valor)}</td>
            </tr>
          ))}
          <tr>
            <td className="py-2 font-semibold text-ink">Total que sai</td>
            <td className="py-2 text-right font-semibold text-orange-dark">{formatBRL(sai)}</td>
          </tr>
        </tbody>
      </table>

      {porPessoa.length ? (
        <div className="mb-6">
          <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Por pessoa</h4>
          <p className="text-ink/55 text-[13px] mb-4">
            Os mesmos itens acima, separados por quem paga cada um — preencha o campo &ldquo;Quem
            paga&rdquo; em cada item pra aparecer aqui.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {porPessoa.map((grupo) => (
              <div key={grupo.pessoa} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ink text-[15px]">{grupo.pessoa}</span>
                  <span className="font-semibold text-orange-dark text-[14px]">{formatBRL(grupo.total)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {grupo.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[13px]">
                      <span className="text-ink/70 truncate">{item.nome}</span>
                      <span className="text-ink/70 shrink-0 ml-2">{formatBRL(item.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={baixarPdf}
        disabled={gerandoPdf}
        className="text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4 disabled:opacity-60"
      >
        {gerandoPdf ? "Gerando PDF…" : "↓ Baixar resumo em PDF"}
      </button>
    </Card>
  );
}

function BarraComparativa({ label, valor, max, cor }: { label: string; valor: number; max: number; cor: string }) {
  const pct = Math.max(2, Math.min(100, (valor / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-[13px] font-semibold text-ink/70 shrink-0">{label}</span>
      <div className="flex-1 h-6 rounded-full bg-cream-dark overflow-hidden">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-28 text-[13px] font-semibold text-ink text-right shrink-0">{formatBRL(valor)}</span>
    </div>
  );
}
