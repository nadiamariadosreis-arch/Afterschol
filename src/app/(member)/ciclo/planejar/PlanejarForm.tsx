"use client";

import { useActionState, useState } from "react";
import { salvarPlanejarAction, autosalvarPlanejarAction, type PlanejarState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AutosaveIndicator } from "@/components/ui/AutosaveIndicator";
import { useAutosave } from "@/lib/useAutosave";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import { PROCESSO_INFO, MEIO_PAGAMENTO_LABEL, URGENCIA_LABEL } from "@/lib/apfa/processos";
import {
  PROCESSO_ORDER,
  type CartaoItem,
  type Divida,
  type FaturaItem,
  type ItemMes,
  type MeioPagamento,
  type PlanejarData,
  type ProcessoKey,
} from "@/lib/apfa/types";

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `pj-${Date.now()}-${idCounter}`;
}

const TABS = [
  { key: "reuniao", label: "Parte técnica" },
  { key: "dividas", label: "Dívidas" },
  { key: "mes", label: "Organização do mês" },
  { key: "cartao", label: "Cartão de crédito" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const initialState: PlanejarState = {};

export function PlanejarForm({
  cycleId,
  familyId,
  initial,
}: {
  cycleId: string;
  familyId: string;
  initial: PlanejarData;
}) {
  const [state, formAction, pending] = useActionState(salvarPlanejarAction, initialState);
  const [tab, setTab] = useState<TabKey>("reuniao");

  const [reuniao, setReuniao] = useState(initial.reuniao);
  const [dividas, setDividas] = useState<Divida[]>(initial.dividas);
  const [mes, setMes] = useState<ItemMes[]>(initial.organizacao_mes);
  const [cartao, setCartao] = useState(initial.cartao);
  const [completedAt] = useState(initial.completed_at);

  const payload: PlanejarData = {
    reuniao,
    dividas,
    organizacao_mes: mes,
    cartao,
    completed_at: completedAt,
  };

  const autosaveStatus = useAutosave(payload, (draft) => autosalvarPlanejarAction(cycleId, draft));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="planejar" value={JSON.stringify(payload)} readOnly />

      <div className="flex flex-wrap gap-2 border-b border-line pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${
              tab === t.key ? "bg-orange text-white" : "text-ink/70 hover:bg-cream-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "reuniao" ? <ReuniaoTab reuniao={reuniao} setReuniao={setReuniao} /> : null}
      {tab === "dividas" ? <DividasTab dividas={dividas} setDividas={setDividas} /> : null}
      {tab === "mes" ? <MesTab itens={mes} setItens={setMes} /> : null}
      {tab === "cartao" ? <CartaoTab familyId={familyId} cartao={cartao} setCartao={setCartao} /> : null}

      {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Salvando…" : "Salvar e ir para Fazer Acontecer →"}
        </Button>
        <AutosaveIndicator status={autosaveStatus} />
      </div>
    </form>
  );
}

function ReuniaoTab({
  reuniao,
  setReuniao,
}: {
  reuniao: PlanejarData["reuniao"];
  setReuniao: (v: PlanejarData["reuniao"]) => void;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Parte técnica</h3>
        <p className="text-ink/60 text-[14px]">
          Defina o dia e a cadência da reunião de dinheiro, combine quem acompanha o quê, e já marque
          a data da próxima.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] text-ink/70">Dia combinado (ex: todo dia 5)</span>
          <input
            type="text"
            value={reuniao.dia}
            onChange={(e) => setReuniao({ ...reuniao, dia: e.target.value })}
            className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] text-ink/70">Cadência</span>
          <select
            value={reuniao.cadencia}
            onChange={(e) => setReuniao({ ...reuniao, cadencia: e.target.value as "mensal" | "quinzenal" | "" })}
            className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
          >
            <option value="">Selecione</option>
            <option value="mensal">Mensal</option>
            <option value="quinzenal">Quinzenal</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[14px] text-ink/70">Quem acompanha o quê</span>
          <textarea
            value={reuniao.responsaveis}
            onChange={(e) => setReuniao({ ...reuniao, responsaveis: e.target.value })}
            rows={3}
            className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
            placeholder="Ex: eu cuido das contas fixas, meu marido cuida do cartão…"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] text-ink/70">Próxima reunião</span>
          <input
            type="date"
            value={reuniao.proxima_data}
            onChange={(e) => setReuniao({ ...reuniao, proxima_data: e.target.value })}
            className="border border-line bg-cream rounded-xl px-4 py-2.5 outline-none focus:border-orange"
          />
        </label>
      </div>
    </Card>
  );
}

function DividasTab({ dividas, setDividas }: { dividas: Divida[]; setDividas: (fn: (d: Divida[]) => Divida[]) => void }) {
  function update(id: string, patch: Partial<Divida>) {
    setDividas((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function remove(id: string) {
    setDividas((d) => d.filter((x) => x.id !== id));
  }
  function add() {
    setDividas((d) => [
      ...d,
      { id: newId(), nome: "", valor: 0, juros: null, urgencia: "media", dolorosa: false, origem_pagamento: "", quitada: false },
    ]);
  }

  const ordenadas = [...dividas].sort((a, b) => Number(b.dolorosa) - Number(a.dolorosa));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Organização das dívidas</h3>
        <p className="text-ink/60 text-[14px]">
          Marque primeiro qual dívida está tirando o sono da família hoje — mesmo que não seja a
          maior nem a de juro mais alto. Ela entra primeiro no plano de ação: juros alto dá pra
          negociar, peso emocional não. Depois organize as demais por urgência, juros ou valor.
        </p>
      </Card>
      {ordenadas.map((div) => (
        <Card key={div.id} className={div.dolorosa ? "border-orange" : ""}>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[13px] text-ink/70">Nome da dívida</span>
              <input
                type="text"
                value={div.nome}
                onChange={(e) => update(div.id, { nome: e.target.value })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Valor total</span>
              <input
                type="number"
                min={0}
                value={div.valor || ""}
                onChange={(e) => update(div.id, { valor: parseFloat(e.target.value) || 0 })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Juros (% ao mês, se souber)</span>
              <input
                type="number"
                min={0}
                value={div.juros ?? ""}
                onChange={(e) => update(div.id, { juros: e.target.value ? parseFloat(e.target.value) : null })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Urgência</span>
              <select
                value={div.urgencia}
                onChange={(e) => update(div.id, { urgencia: e.target.value as Divida["urgencia"] })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              >
                {Object.entries(URGENCIA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">De onde vai sair o dinheiro</span>
              <input
                type="text"
                value={div.origem_pagamento}
                onChange={(e) => update(div.id, { origem_pagamento: e.target.value })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <div className="flex items-center gap-6 sm:col-span-2 mt-1">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={div.dolorosa} onChange={(e) => update(div.id, { dolorosa: e.target.checked })} />
                Esta é a que tira o sono da família
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={div.quitada} onChange={(e) => update(div.id, { quitada: e.target.checked })} />
                Já quitada
              </label>
              <button type="button" onClick={() => remove(div.id)} className="ml-auto text-ink/40 hover:text-orange-dark text-[14px]">
                Remover
              </button>
            </div>
          </div>
        </Card>
      ))}
      <button type="button" onClick={add} className="self-start text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4">
        + Adicionar dívida
      </button>
    </div>
  );
}

function MesTab({ itens, setItens }: { itens: ItemMes[]; setItens: (fn: (i: ItemMes[]) => ItemMes[]) => void }) {
  function update(id: string, patch: Partial<ItemMes>) {
    setItens((i) => i.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function remove(id: string) {
    setItens((i) => i.filter((x) => x.id !== id));
  }
  function add() {
    setItens((i) => [
      ...i,
      { id: newId(), nome: "", processo: "essencial", dia_pagamento: null, quem_paga: "", meio_pagamento: "pix", cortar: false },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Organização do mês</h3>
        <p className="text-ink/60 text-[14px]">
          Para cada conta, defina o dia de pagamento, quem paga e o meio de pagamento. Marque o que
          pode ser cortado ou ajustado.
        </p>
      </Card>
      {itens.map((item) => (
        <Card key={item.id}>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5 sm:col-span-3">
              <span className="text-[13px] text-ink/70">Item</span>
              <input
                type="text"
                value={item.nome}
                onChange={(e) => update(item.id, { nome: e.target.value })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Processo</span>
              <select
                value={item.processo}
                onChange={(e) => update(item.id, { processo: e.target.value as ProcessoKey })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              >
                {PROCESSO_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {PROCESSO_INFO[p].titulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Dia do pagamento</span>
              <input
                type="number"
                min={1}
                max={31}
                value={item.dia_pagamento ?? ""}
                onChange={(e) => update(item.id, { dia_pagamento: e.target.value ? parseInt(e.target.value) : null })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Meio de pagamento</span>
              <select
                value={item.meio_pagamento}
                onChange={(e) => update(item.id, { meio_pagamento: e.target.value as MeioPagamento })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              >
                {Object.entries(MEIO_PAGAMENTO_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[13px] text-ink/70">Quem paga</span>
              <input
                type="text"
                value={item.quem_paga}
                onChange={(e) => update(item.id, { quem_paga: e.target.value })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <div className="flex items-center gap-4 sm:col-span-3 mt-1">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={item.cortar} onChange={(e) => update(item.id, { cortar: e.target.checked })} />
                Pode ser cortado ou ajustado
              </label>
              <button type="button" onClick={() => remove(item.id)} className="ml-auto text-ink/40 hover:text-orange-dark text-[14px]">
                Remover
              </button>
            </div>
          </div>
        </Card>
      ))}
      <button type="button" onClick={add} className="self-start text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4">
        + Adicionar item do mês
      </button>
    </div>
  );
}

function CartaoTab({
  familyId,
  cartao,
  setCartao,
}: {
  familyId: string;
  cartao: PlanejarData["cartao"];
  setCartao: (v: PlanejarData["cartao"]) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);

  function updateCartao(id: string, patch: Partial<CartaoItem>) {
    setCartao({ ...cartao, cartoes: cartao.cartoes.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }
  function removeCartao(id: string) {
    setCartao({ ...cartao, cartoes: cartao.cartoes.filter((c) => c.id !== id) });
  }
  function addCartao() {
    const novo: CartaoItem = { id: newId(), nome: "", valor_ultima_fatura: 0, itens: [], pdf_path: null, avaliacao: "" };
    setCartao({ ...cartao, quantidade: cartao.cartoes.length + 1, cartoes: [...cartao.cartoes, novo] });
  }

  function updateFaturaItem(cartaoId: string, itemId: string, patch: Partial<FaturaItem>) {
    setCartao({
      ...cartao,
      cartoes: cartao.cartoes.map((c) =>
        c.id === cartaoId ? { ...c, itens: c.itens.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) } : c,
      ),
    });
  }
  function removeFaturaItem(cartaoId: string, itemId: string) {
    setCartao({
      ...cartao,
      cartoes: cartao.cartoes.map((c) => (c.id === cartaoId ? { ...c, itens: c.itens.filter((i) => i.id !== itemId) } : c)),
    });
  }
  function addFaturaItem(cartaoId: string) {
    const novo: FaturaItem = { id: newId(), descricao: "", valor: 0, tipo: "unica", processo: "essencial", manter: true };
    setCartao({
      ...cartao,
      cartoes: cartao.cartoes.map((c) => (c.id === cartaoId ? { ...c, itens: [...c.itens, novo] } : c)),
    });
  }

  async function handleUpload(cartaoId: string, file: File) {
    setUploading(cartaoId);
    const supabase = createClient();
    const path = `${familyId}/${cartaoId}.pdf`;
    const { error } = await supabase.storage.from("faturas").upload(path, file, { upsert: true });
    setUploading(null);
    if (!error) updateCartao(cartaoId, { pdf_path: path });
  }

  const previsaoPorProcesso = PROCESSO_ORDER.map((p) => {
    const total = cartao.cartoes.reduce(
      (sum, c) => sum + c.itens.filter((i) => i.manter && i.processo === p).reduce((s, i) => s + i.valor, 0),
      0,
    );
    return { processo: p, total };
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Módulo Cartão de Crédito</h3>
        <p className="text-ink/60 text-[14px]">
          Quantos cartões a família tem, o valor da última fatura e o que veio nela — separando o que
          é recorrente do que foi compra única. Envie o PDF da fatura ou preencha manualmente, e
          avalie o que pode ser cancelado.
        </p>
      </Card>

      {cartao.cartoes.map((c) => (
        <Card key={c.id} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Nome do cartão</span>
              <input
                type="text"
                value={c.nome}
                onChange={(e) => updateCartao(c.id, { nome: e.target.value })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ink/70">Valor da última fatura</span>
              <input
                type="number"
                min={0}
                value={c.valor_ultima_fatura || ""}
                onChange={(e) => updateCartao(c.id, { valor_ultima_fatura: parseFloat(e.target.value) || 0 })}
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-ink/70">PDF da fatura (opcional)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files?.[0] && handleUpload(c.id, e.target.files[0])}
              className="text-[13px]"
            />
            {uploading === c.id ? <span className="text-[12px] text-ink/50">Enviando…</span> : null}
            {c.pdf_path ? <span className="text-[12px] text-sage">Fatura enviada ✓</span> : null}
          </label>

          <div>
            <span className="text-[13px] text-ink/70 mb-2 block">Itens da fatura (recorrente × única)</span>
            <div className="flex flex-col gap-2">
              {c.itens.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_100px_110px_110px_auto_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={item.descricao}
                    placeholder="Descrição"
                    onChange={(e) => updateFaturaItem(c.id, item.id, { descricao: e.target.value })}
                    className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.valor || ""}
                    placeholder="Valor"
                    onChange={(e) => updateFaturaItem(c.id, item.id, { valor: parseFloat(e.target.value) || 0 })}
                    className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                  />
                  <select
                    value={item.tipo}
                    onChange={(e) => updateFaturaItem(c.id, item.id, { tipo: e.target.value as FaturaItem["tipo"] })}
                    className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                  >
                    <option value="recorrente">Recorrente</option>
                    <option value="unica">Única</option>
                  </select>
                  <select
                    value={item.processo}
                    onChange={(e) => updateFaturaItem(c.id, item.id, { processo: e.target.value as ProcessoKey })}
                    className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                  >
                    {PROCESSO_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {PROCESSO_INFO[p].titulo}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-[12px]">
                    <input
                      type="checkbox"
                      checked={item.manter}
                      onChange={(e) => updateFaturaItem(c.id, item.id, { manter: e.target.checked })}
                    />
                    Manter
                  </label>
                  <button type="button" onClick={() => removeFaturaItem(c.id, item.id)} className="text-ink/40 hover:text-orange-dark">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addFaturaItem(c.id)}
              className="mt-2 text-[13px] font-semibold text-orange-dark hover:underline underline-offset-4"
            >
              + Adicionar item da fatura
            </button>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-ink/70">O que pode ser cancelado, o que não vale mais comprar</span>
            <textarea
              value={c.avaliacao}
              onChange={(e) => updateCartao(c.id, { avaliacao: e.target.value })}
              rows={2}
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
          </label>

          <button type="button" onClick={() => removeCartao(c.id)} className="self-start text-[13px] text-ink/40 hover:text-orange-dark">
            Remover este cartão
          </button>
        </Card>
      ))}

      <button type="button" onClick={addCartao} className="self-start text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4">
        + Adicionar cartão
      </button>

      {cartao.cartoes.length ? (
        <Card>
          <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-3">Previsão da próxima fatura, por processo</h4>
          <div className="flex flex-col gap-2">
            {previsaoPorProcesso.map((p) => (
              <div key={p.processo} className="flex justify-between text-[14px]">
                <span className="text-ink/70">{PROCESSO_INFO[p.processo].titulo}</span>
                <span className="font-semibold">{formatBRL(p.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
