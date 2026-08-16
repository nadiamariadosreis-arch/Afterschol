"use client";

import { useActionState, useState } from "react";
import { salvarPlanejarAction, autosalvarPlanejarAction, type PlanejarState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AutosaveIndicator } from "@/components/ui/AutosaveIndicator";
import { useAutosave } from "@/lib/useAutosave";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import {
  itensMesFromAvaliar,
  itensMesFromEventos,
  mesclarItensMesComAvaliar,
  mesclarItensMesComEventos,
  resumoPorPessoaMes,
  valorOrcadoItemMes,
} from "@/lib/apfa/calc";
import { PROCESSO_INFO, MEIO_PAGAMENTO_LABEL, URGENCIA_LABEL } from "@/lib/apfa/processos";
import {
  PROCESSO_ORDER,
  type AvaliarData,
  type CartaoItem,
  type Divida,
  type EventoEspecial,
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
  avaliar,
}: {
  cycleId: string;
  familyId: string;
  initial: PlanejarData;
  avaliar: AvaliarData | null;
}) {
  const [state, formAction, pending] = useActionState(salvarPlanejarAction, initialState);
  const [tab, setTab] = useState<TabKey>("reuniao");
  const [avancando, setAvancando] = useState(false);

  const [reuniao, setReuniao] = useState<PlanejarData["reuniao"]>(() => ({
    dia: initial.reuniao.dia,
    cadencia: initial.reuniao.cadencia,
    responsaveis: initial.reuniao.responsaveis,
    proxima_data: initial.reuniao.proxima_data,
    // Dados salvos antes desse campo existir não têm eventos_especiais — cai pra lista vazia.
    eventos_especiais: initial.reuniao.eventos_especiais ?? [],
  }));
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

  const tabIndex = TABS.findIndex((t) => t.key === tab);
  const proximaTab = TABS[tabIndex + 1];

  async function avancarPara(next: TabKey) {
    setAvancando(true);
    try {
      await autosalvarPlanejarAction(cycleId, payload);
    } finally {
      setAvancando(false);
    }
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

      {tab === "reuniao" ? (
        <>
          <ReuniaoTab reuniao={reuniao} setReuniao={setReuniao} />
          <EventosEspeciaisSection reuniao={reuniao} setReuniao={setReuniao} />
          <ReuniaoResumo reuniao={reuniao} />
        </>
      ) : null}
      {tab === "dividas" ? (
        <>
          <DividasTab dividas={dividas} setDividas={setDividas} />
          <DividasResumo dividas={dividas} />
        </>
      ) : null}
      {tab === "mes" ? (
        <>
          <MesTab itens={mes} setItens={setMes} avaliar={avaliar} eventos={reuniao.eventos_especiais} />
          <MesResumo itens={mes} avaliar={avaliar} />
        </>
      ) : null}
      {tab === "cartao" ? <CartaoTab familyId={familyId} cartao={cartao} setCartao={setCartao} /> : null}

      {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

      <div className="flex items-center gap-4">
        {proximaTab ? (
          <Button type="button" disabled={avancando} onClick={() => avancarPara(proximaTab.key)} className="self-start">
            {avancando ? "Salvando…" : `Salvar e ir para ${proximaTab.label} →`}
          </Button>
        ) : (
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Salvando…" : "Salvar e ir para Fazer Acontecer →"}
          </Button>
        )}
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

function EventosEspeciaisSection({
  reuniao,
  setReuniao,
}: {
  reuniao: PlanejarData["reuniao"];
  setReuniao: (v: PlanejarData["reuniao"]) => void;
}) {
  const eventos = reuniao.eventos_especiais;

  function update(id: string, patch: Partial<EventoEspecial>) {
    setReuniao({ ...reuniao, eventos_especiais: eventos.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }
  function remove(id: string) {
    setReuniao({ ...reuniao, eventos_especiais: eventos.filter((e) => e.id !== id) });
  }
  function add() {
    setReuniao({
      ...reuniao,
      eventos_especiais: [...eventos, { id: newId(), nome: "", data: "", valor_estimado: 0 }],
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">
          Datas e eventos especiais do mês
        </h3>
        <p className="text-ink/60 text-[14px]">
          Aniversário, presente, festa, casamento — tudo que vai pesar no bolso além das contas de
          sempre. Quem entrar aqui aparece depois na Organização do mês, já com o valor previsto.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {eventos.map((evento) => (
          <div key={evento.id} className="grid grid-cols-[1fr_140px_140px_auto] gap-2 items-center">
            <input
              type="text"
              value={evento.nome}
              onChange={(e) => update(evento.id, { nome: e.target.value })}
              placeholder="Ex: Aniversário da Maria"
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
            <input
              type="date"
              value={evento.data}
              onChange={(e) => update(evento.id, { data: e.target.value })}
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={evento.valor_estimado || ""}
              onChange={(e) => update(evento.id, { valor_estimado: parseFloat(e.target.value) || 0 })}
              placeholder="Valor previsto"
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
            <button
              type="button"
              onClick={() => remove(evento.id)}
              aria-label="Remover evento"
              className="text-ink/40 hover:text-orange-dark px-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="self-start text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4"
      >
        + Adicionar data ou evento
      </button>
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
      {
        id: newId(),
        nome: "",
        valor: 0,
        juros: null,
        urgencia: "media",
        dolorosa: false,
        origem_pagamento: "",
        quitada: false,
        negociada: "",
        forma_pagamento: "",
        data_pagamento: "",
        entra_fazer_acontecer: false,
        valor_fazer_acontecer: null,
      },
    ]);
  }

  const ordenadas = [...dividas].sort((a, b) => Number(a.quitada) - Number(b.quitada) || Number(b.dolorosa) - Number(a.dolorosa));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Organização das dívidas</h3>
        <p className="text-ink/60 text-[14px]">
          As dívidas em aberto se mantêm de mês a mês — não precisa recadastrar. Marque &ldquo;Já
          quitada&rdquo; quando pagar: some da lista do mês seguinte, mas continua aparecendo aqui até o fim deste
          mês, riscada, como registro de que foi paga. Continue adicionando as novas conforme
          surgirem, e marque primeiro qual está tirando o sono da família hoje — mesmo que não seja
          a maior nem a de juro mais alto: ela entra primeiro no plano de ação, porque juros alto dá
          pra negociar, peso emocional não.
        </p>
      </Card>
      {ordenadas.map((div) => (
        <Card key={div.id} className={div.quitada ? "opacity-60" : div.dolorosa ? "border-orange" : ""}>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[13px] text-ink/70">Nome da dívida</span>
              <input
                type="text"
                value={div.nome}
                onChange={(e) => update(div.id, { nome: e.target.value })}
                className={`border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange ${div.quitada ? "line-through" : ""}`}
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
            {!div.quitada ? (
              <div className="sm:col-span-2 border-t border-line pt-3 mt-1 flex flex-col gap-3">
                <span className="text-[13px] font-semibold text-ink/70">Negociação</span>
                <p className="text-[12px] text-ink/50 -mt-1.5">
                  Muitas famílias endividadas não vão pagar a dívida toda já no mês que vem — tudo bem,
                  é só marcar como está agora.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink/70">Conseguiu negociar?</span>
                    <select
                      value={div.negociada}
                      onChange={(e) => update(div.id, { negociada: e.target.value as Divida["negociada"] })}
                      className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                    >
                      <option value="">Ainda não sei</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não, ainda preciso negociar</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink/70">Forma de pagamento</span>
                    <select
                      value={div.forma_pagamento}
                      onChange={(e) => update(div.id, { forma_pagamento: e.target.value as Divida["forma_pagamento"] })}
                      className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                    >
                      <option value="">Selecione</option>
                      <option value="parcelado">Parcelado (por mês)</option>
                      <option value="avista">À vista (valor cheio)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink/70">Data definida p/ pagamento</span>
                    <input
                      type="date"
                      value={div.data_pagamento}
                      onChange={(e) => update(div.id, { data_pagamento: e.target.value })}
                      className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                    />
                  </label>
                </div>

                <div className="rounded-lg bg-cream border border-line px-4 py-3 flex flex-col gap-2.5">
                  <label className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <input
                      type="checkbox"
                      checked={div.entra_fazer_acontecer}
                      onChange={(e) =>
                        update(div.id, {
                          entra_fazer_acontecer: e.target.checked,
                          valor_fazer_acontecer: e.target.checked ? (div.valor_fazer_acontecer ?? div.valor) : div.valor_fazer_acontecer,
                        })
                      }
                    />
                    Esta dívida entra no Fazer Acontecer deste mês
                  </label>
                  {div.entra_fazer_acontecer ? (
                    <label className="flex flex-col gap-1.5 max-w-xs">
                      <span className="text-[13px] text-ink/70">Valor que deve aparecer lá</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={div.valor_fazer_acontecer ?? ""}
                        onChange={(e) =>
                          update(div.id, { valor_fazer_acontecer: e.target.value ? parseFloat(e.target.value) : null })
                        }
                        className="border border-line bg-white rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                      />
                      <span className="text-[12px] text-ink/50">
                        Pode ser a parcela negociada — não precisa ser o valor total da dívida.
                      </span>
                    </label>
                  ) : (
                    <p className="text-[13px] text-ink/60">
                      Não vai aparecer no checklist de execução deste mês — ainda em negociação.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-6 sm:col-span-2 mt-1">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={div.dolorosa} onChange={(e) => update(div.id, { dolorosa: e.target.checked })} />
                Esta é a que tira o sono da família
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={div.quitada} onChange={(e) => update(div.id, { quitada: e.target.checked })} />
                Já quitada (risca e some da lista a partir do mês seguinte)
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

function MesTab({
  itens,
  setItens,
  avaliar,
  eventos,
}: {
  itens: ItemMes[];
  setItens: (fn: (i: ItemMes[]) => ItemMes[]) => void;
  avaliar: AvaliarData | null;
  eventos: EventoEspecial[];
}) {
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

  const nomesExistentes = new Set(itens.map((i) => i.nome.trim().toLowerCase()).filter(Boolean));
  const disponiveisNoAvaliar = itensMesFromAvaliar(avaliar).filter(
    (i) => !nomesExistentes.has(i.nome.trim().toLowerCase()),
  );
  const disponiveisNosEventos = itensMesFromEventos(eventos).filter(
    (i) => !nomesExistentes.has(i.nome.trim().toLowerCase()),
  );

  function trazerDoAvaliar() {
    setItens((atual) => mesclarItensMesComAvaliar(atual, avaliar));
  }
  function trazerDosEventos() {
    setItens((atual) => mesclarItensMesComEventos(atual, eventos));
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Organização do mês</h3>
        <p className="text-ink/60 text-[14px] mb-3">
          A partir do segundo mês, isso já vem pronto do mês anterior — item, dia de pagamento, quem
          paga e o meio — porque são as mesmas contas básicas se repetindo. É só revisar e editar o
          que mudou. Se faltar algo novo, os botões abaixo trazem itens do Avaliar (contas fixas,
          gastos variáveis e parcelas) ou eventos especiais da parte técnica. Marque o que pode ser
          cortado ou ajustado, e apague ou adicione o que precisar.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {disponiveisNoAvaliar.length ? (
            <button
              type="button"
              onClick={trazerDoAvaliar}
              className="text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4"
            >
              ↓ Trazer {disponiveisNoAvaliar.length} {disponiveisNoAvaliar.length === 1 ? "item" : "itens"} do Avaliar
            </button>
          ) : avaliar ? (
            <p className="text-[13px] text-sage">✓ Itens do Avaliar já estão todos aqui.</p>
          ) : null}
          {disponiveisNosEventos.length ? (
            <button
              type="button"
              onClick={trazerDosEventos}
              className="text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4"
            >
              ↓ Trazer {disponiveisNosEventos.length} {disponiveisNosEventos.length === 1 ? "evento" : "eventos"} da
              parte técnica
            </button>
          ) : null}
        </div>
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
              <span className="text-[13px] text-ink/70">Valor previsto (opcional)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.valor_estimado || ""}
                onChange={(e) => update(item.id, { valor_estimado: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Se ainda não está em outro lugar"
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

function ReuniaoResumo({ reuniao }: { reuniao: PlanejarData["reuniao"] }) {
  const preenchido =
    reuniao.dia || reuniao.cadencia || reuniao.responsaveis || reuniao.proxima_data || reuniao.eventos_especiais.length;
  if (!preenchido) return null;

  return (
    <Card>
      <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Resumo da parte técnica</h4>
      <p className="text-ink/55 text-[13px] mb-4">O que ficou combinado até agora.</p>
      <dl className="grid sm:grid-cols-2 gap-4 text-[14px]">
        <div>
          <dt className="text-ink/55 text-[11px] uppercase tracking-wide font-semibold mb-0.5">Dia combinado</dt>
          <dd className="text-ink font-semibold">{reuniao.dia || "—"}</dd>
        </div>
        <div>
          <dt className="text-ink/55 text-[11px] uppercase tracking-wide font-semibold mb-0.5">Cadência</dt>
          <dd className="text-ink font-semibold">
            {reuniao.cadencia === "mensal" ? "Mensal" : reuniao.cadencia === "quinzenal" ? "Quinzenal" : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink/55 text-[11px] uppercase tracking-wide font-semibold mb-0.5">Quem acompanha o quê</dt>
          <dd className="text-ink">{reuniao.responsaveis || "—"}</dd>
        </div>
        <div>
          <dt className="text-ink/55 text-[11px] uppercase tracking-wide font-semibold mb-0.5">Próxima reunião</dt>
          <dd className="text-ink font-semibold">{reuniao.proxima_data || "—"}</dd>
        </div>
      </dl>

      {reuniao.eventos_especiais.length ? (
        <div className="mt-5 pt-4 border-t border-line">
          <p className="text-ink/55 text-[11px] uppercase tracking-wide font-semibold mb-2">
            Datas e eventos especiais
          </p>
          <div className="flex flex-col gap-1.5">
            {reuniao.eventos_especiais.map((evento) => (
              <div key={evento.id} className="flex items-center justify-between text-[14px]">
                <span className="text-ink">
                  {evento.nome || "Sem nome"}
                  {evento.data ? <span className="text-ink/50"> — {evento.data}</span> : null}
                </span>
                <span className="font-semibold text-ink">{formatBRL(evento.valor_estimado)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-[14px] pt-1.5 mt-1 border-t border-line">
              <span className="font-semibold text-ink">Total previsto</span>
              <span className="font-semibold text-orange-dark">
                {formatBRL(reuniao.eventos_especiais.reduce((sum, e) => sum + e.valor_estimado, 0))}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function DividasResumo({ dividas }: { dividas: Divida[] }) {
  if (!dividas.length) return null;

  const abertas = dividas.filter((d) => !d.quitada);
  const quitadas = dividas.filter((d) => d.quitada);
  const totalAberto = abertas.reduce((sum, d) => sum + d.valor, 0);
  const ordenadas = [...abertas].sort((a, b) => b.valor - a.valor);
  const maior = Math.max(...ordenadas.map((d) => d.valor), 1);

  return (
    <Card>
      <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Resumo das dívidas</h4>
      <p className="text-ink/55 text-[13px] mb-4">
        {abertas.length} {abertas.length === 1 ? "dívida em aberto" : "dívidas em aberto"}, somando{" "}
        <strong className="text-ink">{formatBRL(totalAberto)}</strong>
        {quitadas.length ? `. ${quitadas.length} já quitada${quitadas.length === 1 ? "" : "s"} este mês.` : "."}
      </p>

      {ordenadas.length ? (
        <div className="flex flex-col gap-2 mb-6">
          {ordenadas.map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="w-32 text-[13px] text-ink/70 truncate shrink-0">{d.nome || "Sem nome"}</span>
              <div className="flex-1 h-5 rounded-full bg-cream-dark overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.dolorosa ? "bg-orange-dark" : "bg-mint"}`}
                  style={{ width: `${Math.max(2, Math.min(100, (d.valor / maior) * 100))}%` }}
                />
              </div>
              <span className="w-24 text-[13px] font-semibold text-ink text-right shrink-0">{formatBRL(d.valor)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-t border-line min-w-[560px]">
          <thead>
            <tr className="text-ink/55 text-[11px] uppercase tracking-wide">
              <th className="text-left font-semibold py-2">Dívida</th>
              <th className="text-right font-semibold py-2">Valor</th>
              <th className="text-left font-semibold py-2 pl-4">Urgência</th>
              <th className="text-left font-semibold py-2 pl-4">Juros</th>
              <th className="text-left font-semibold py-2 pl-4">Situação</th>
            </tr>
          </thead>
          <tbody>
            {[...ordenadas, ...quitadas].map((d) => (
              <tr key={d.id} className={`border-b border-line ${d.quitada ? "opacity-50" : ""}`}>
                <td className={`py-2 text-ink ${d.quitada ? "line-through" : ""}`}>
                  {d.nome || "Sem nome"}
                  {d.dolorosa && !d.quitada ? (
                    <span className="ml-1.5 text-orange-dark" title="Tira o sono da família">●</span>
                  ) : null}
                </td>
                <td className="py-2 text-right font-semibold text-ink">{formatBRL(d.valor)}</td>
                <td className="py-2 pl-4 text-ink/75">{URGENCIA_LABEL[d.urgencia]}</td>
                <td className="py-2 pl-4 text-ink/75">{d.juros ? `${d.juros}% a.m.` : "—"}</td>
                <td className="py-2 pl-4 text-ink/75">{d.quitada ? "Quitada" : "Em aberto"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MesResumo({ itens, avaliar }: { itens: ItemMes[]; avaliar: AvaliarData | null }) {
  if (!itens.length) return null;

  const podeCortar = itens.filter((i) => i.cortar).length;
  const totalPrevisto = itens.reduce((sum, i) => sum + (i.valor_estimado ?? 0), 0);
  const porPessoa = resumoPorPessoaMes(itens, avaliar);

  return (
    <Card>
      <h4 className="font-display-italic font-semibold text-[17px] text-ink mb-1">Resumo da organização do mês</h4>
      <p className="text-ink/55 text-[13px] mb-4">
        {itens.length} {itens.length === 1 ? "item organizado" : "itens organizados"}
        {podeCortar ? `, ${podeCortar} marcado${podeCortar === 1 ? "" : "s"} pra cortar ou ajustar` : ""}
        {totalPrevisto ? `, ${formatBRL(totalPrevisto)} previstos que ainda não estão em outro lugar` : ""}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-t border-line min-w-[640px]">
          <thead>
            <tr className="text-ink/55 text-[11px] uppercase tracking-wide">
              <th className="text-left font-semibold py-2">Item</th>
              <th className="text-left font-semibold py-2 pl-4">Processo</th>
              <th className="text-left font-semibold py-2 pl-4">Dia</th>
              <th className="text-right font-semibold py-2 pl-4">Valor previsto</th>
              <th className="text-left font-semibold py-2 pl-4">Quem paga</th>
              <th className="text-left font-semibold py-2 pl-4">Meio</th>
              <th className="text-left font-semibold py-2 pl-4">Cortar?</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-b border-line">
                <td className="py-2 text-ink">{item.nome || "Sem nome"}</td>
                <td className="py-2 pl-4 text-ink/75">{PROCESSO_INFO[item.processo].titulo}</td>
                <td className="py-2 pl-4 text-ink/75">{item.dia_pagamento ?? "—"}</td>
                <td className="py-2 pl-4 text-right font-semibold text-ink">
                  {item.valor_estimado ? formatBRL(item.valor_estimado) : "—"}
                </td>
                <td className="py-2 pl-4 text-ink/75">{item.quem_paga || "—"}</td>
                <td className="py-2 pl-4 text-ink/75">{MEIO_PAGAMENTO_LABEL[item.meio_pagamento]}</td>
                <td className="py-2 pl-4">{item.cortar ? <span className="text-orange-dark font-semibold">Sim</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {porPessoa.length ? (
        <div className="mt-6 pt-4 border-t border-line">
          <h5 className="font-display-italic font-semibold text-[15px] text-ink mb-1">Por pessoa</h5>
          <p className="text-ink/55 text-[12px] mb-3">
            Preencha &ldquo;Quem paga&rdquo; em cada item acima pra ele aparecer aqui.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {porPessoa.map((grupo) => (
              <div key={grupo.pessoa} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ink text-[14px]">{grupo.pessoa}</span>
                  <span className="font-semibold text-orange-dark text-[13px]">{formatBRL(grupo.total)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {grupo.itens.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[13px]">
                      <span className="text-ink/70 truncate">{item.nome}</span>
                      <span className="text-ink/70 shrink-0 ml-2">{formatBRL(valorOrcadoItemMes(item, avaliar))}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
