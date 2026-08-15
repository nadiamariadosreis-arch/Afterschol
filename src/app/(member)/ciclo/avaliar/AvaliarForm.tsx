"use client";

import { useActionState, useMemo, useState } from "react";
import { salvarAvaliarAction, type AvaliarState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PROCESSO_INFO } from "@/lib/apfa/processos";
import { comparativo } from "@/lib/apfa/calc";
import { formatBRL } from "@/lib/format";
import { PROCESSO_ORDER, type AvaliarData, type ChecklistItem, type ProcessoKey } from "@/lib/apfa/types";

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `item-${Date.now()}-${idCounter}`;
}

function row(nome: string, processo: ProcessoKey): ChecklistItem {
  return { id: newId(), nome, processo, valor: 0 };
}

const SUGESTOES = {
  contas_fixas: [
    row("Aluguel ou financiamento", "essencial"),
    row("Condomínio", "essencial"),
    row("Água, luz e gás", "essencial"),
    row("Internet e telefone", "essencial"),
    row("Plano de saúde", "essencial"),
    row("Escola ou mensalidade escolar", "essencial"),
  ],
  gastos_variaveis: [
    row("Mercado", "essencial"),
    row("Combustível ou transporte", "essencial"),
    row("Lazer e passeios", "presente"),
    row("Restaurantes", "presente"),
  ],
  parcelas: [row("Parcela do cartão de crédito", "compromissos"), row("Empréstimo ou financiamento", "compromissos")],
  gastos_anuais: [
    row("IPVA e licenciamento", "essencial"),
    row("IPTU", "essencial"),
    row("Seguro (carro, vida)", "futuro"),
    row("Material escolar", "essencial"),
  ],
};

const initialState: AvaliarState = {};

export function AvaliarForm({ cycleId, initial, initialPercentuais }: {
  cycleId: string;
  initial: AvaliarData;
  initialPercentuais: Record<ProcessoKey, number>;
}) {
  const [state, formAction, pending] = useActionState(salvarAvaliarAction, initialState);

  const [rendaMensal, setRendaMensal] = useState(initial.renda_mensal);
  const [percentuais, setPercentuais] = useState(initialPercentuais);
  const [contasFixas, setContasFixas] = useState(
    initial.contas_fixas.length ? initial.contas_fixas : SUGESTOES.contas_fixas,
  );
  const [gastosVariaveis, setGastosVariaveis] = useState(
    initial.gastos_variaveis.length ? initial.gastos_variaveis : SUGESTOES.gastos_variaveis,
  );
  const [parcelas, setParcelas] = useState(initial.parcelas.length ? initial.parcelas : SUGESTOES.parcelas);
  const [gastosAnuais, setGastosAnuais] = useState(
    initial.gastos_anuais.length ? initial.gastos_anuais : SUGESTOES.gastos_anuais,
  );

  const somaPercentuais = PROCESSO_ORDER.reduce((sum, k) => sum + (percentuais[k] || 0), 0);

  const avaliarPayload: AvaliarData = {
    renda_mensal: rendaMensal,
    contas_fixas: contasFixas,
    gastos_variaveis: gastosVariaveis,
    parcelas,
    gastos_anuais: gastosAnuais,
    completed_at: null,
  };

  const linhas = useMemo(
    () => comparativo(percentuais, avaliarPayload),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [percentuais, rendaMensal, contasFixas, gastosVariaveis, parcelas, gastosAnuais],
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="avaliar" value={JSON.stringify(avaliarPayload)} readOnly />
      <input type="hidden" name="percentuais" value={JSON.stringify(percentuais)} readOnly />

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Qual é a renda mensal da família?</h3>
        <p className="text-ink/60 text-[14px] mb-4">Some tudo o que entra num mês normal — salário, autônomo, renda extra.</p>
        <input
          type="number"
          min={0}
          step="0.01"
          value={rendaMensal || ""}
          onChange={(e) => setRendaMensal(parseFloat(e.target.value) || 0)}
          className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange max-w-xs"
          placeholder="R$ 0,00"
        />
      </Card>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">O cenário ideal</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          Sugestão automática: 60% Essencial · 10% Compromissos · 15% Futuro · 15% Presente. Ajuste se
          quiser — o importante é que os 4 processos somem 100%.
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          {PROCESSO_ORDER.map((key) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink/70">{PROCESSO_INFO[key].titulo}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentuais[key]}
                  onChange={(e) =>
                    setPercentuais((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))
                  }
                  className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-orange w-full"
                />
                <span className="text-ink/50">%</span>
              </div>
            </label>
          ))}
        </div>
        <p className={`text-[14px] mt-3 font-semibold ${somaPercentuais === 100 ? "text-sage" : "text-orange-dark"}`}>
          Soma atual: {somaPercentuais}% {somaPercentuais === 100 ? "✓" : "— precisa somar 100%"}
        </p>
      </Card>

      <div>
        <h3 className="font-display-italic font-semibold text-[24px] text-ink mb-1">Renda real — o que sai de fato</h3>
        <p className="text-ink/60 text-[14px] mb-5">
          Aqui é a parte mais importante: preencha com o que <strong className="text-ink">você paga
          hoje de verdade</strong> em cada item — não é o que você acha que deveria gastar, é o valor
          real que sai da sua conta. Apague o que não se aplica à sua família e adicione o que
          faltar — já deixamos os itens mais comuns começados para você. É com esses números que a
          plataforma monta, mais abaixo, o diagnóstico comparando sua realidade com o ideal.
        </p>

        <div className="flex flex-col gap-6">
          <ChecklistSection
            titulo="Contas fixas"
            itens={contasFixas}
            setItens={setContasFixas}
          />
          <ChecklistSection
            titulo="Gastos variáveis"
            itens={gastosVariaveis}
            setItens={setGastosVariaveis}
          />
          <ChecklistSection
            titulo="Parcelas"
            itens={parcelas}
            setItens={setParcelas}
          />
          <ChecklistSection
            titulo="Gastos anuais"
            subtitulo="Informe o valor anual — dividimos por 12 automaticamente no comparativo."
            itens={gastosAnuais}
            setItens={setGastosAnuais}
            anual
          />
        </div>
      </div>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Seu diagnóstico — Ideal × Real</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          Isto se atualiza sozinho conforme você preenche os campos acima. Mostra, processo por
          processo, onde está dentro do combinado, onde está sobrando espaço e onde está saindo
          mais dinheiro do que o planejado.
        </p>
        <div className="flex flex-col gap-4">
          {linhas.map((linha) => {
            const dentro = Math.abs(linha.diferencaPct) <= 3;
            const acima = linha.diferencaPct > 3;
            return (
              <div key={linha.processo} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[15px] flex-wrap gap-1">
                  <span className="font-semibold text-ink">{PROCESSO_INFO[linha.processo].titulo}</span>
                  <span className={`text-[13px] font-semibold ${dentro ? "text-sage" : "text-orange-dark"}`}>
                    {dentro
                      ? "✓ dentro do combinado"
                      : acima
                        ? "▲ acima do ideal — está saindo mais dinheiro aqui do que deveria"
                        : "▼ abaixo do ideal — sobra espaço aqui"}
                  </span>
                </div>
                <span className="text-ink/60 text-[13px]">
                  ideal {linha.idealPct}% ({formatBRL(linha.idealValor)}) · você está em{" "}
                  {linha.realPct.toFixed(0)}% ({formatBRL(linha.realValor)})
                </span>
                <div className="h-2.5 w-full rounded-full bg-cream-dark overflow-hidden relative mt-1">
                  <div className="h-full bg-orange-light absolute inset-y-0 left-0" style={{ width: `${linha.idealPct}%` }} />
                  <div
                    className={`h-full rounded-full absolute inset-y-0 left-0 ${dentro ? "bg-sage" : "bg-orange-dark"}`}
                    style={{ width: `${Math.min(100, linha.realPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando…" : "Salvar e ir para Planejar →"}
      </Button>
    </form>
  );
}

function ChecklistSection({
  titulo,
  subtitulo,
  itens,
  setItens,
  anual,
}: {
  titulo: string;
  subtitulo?: string;
  itens: ChecklistItem[];
  setItens: (fn: (items: ChecklistItem[]) => ChecklistItem[]) => void;
  anual?: boolean;
}) {
  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    setItens((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function removeItem(id: string) {
    setItens((items) => items.filter((i) => i.id !== id));
  }
  function addItem() {
    setItens((items) => [...items, row("", "essencial")]);
  }

  return (
    <Card>
      <h4 className="font-display-italic font-semibold text-[18px] text-ink mb-1">{titulo}</h4>
      {subtitulo ? <p className="text-ink/55 text-[13px] mb-4">{subtitulo}</p> : null}
      <div className="flex flex-col gap-2.5">
        {itens.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_140px_120px_auto] gap-2 items-center">
            <input
              type="text"
              value={item.nome}
              onChange={(e) => updateItem(item.id, { nome: e.target.value })}
              placeholder="Nome do item"
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
            <select
              value={item.processo}
              onChange={(e) => updateItem(item.id, { processo: e.target.value as ProcessoKey })}
              className="border border-line bg-cream rounded-lg px-2 py-2 text-[14px] outline-none focus:border-orange"
            >
              {PROCESSO_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PROCESSO_INFO[p].titulo}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.valor || ""}
              onChange={(e) => updateItem(item.id, { valor: parseFloat(e.target.value) || 0 })}
              placeholder={anual ? "Valor anual" : "Valor"}
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label="Remover item"
              className="text-ink/40 hover:text-orange-dark px-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4"
      >
        + Adicionar item
      </button>
    </Card>
  );
}
