"use client";

import { useActionState, useMemo, useState } from "react";
import { salvarAcompanharAction, autosalvarAcompanharAction, type AcompanharState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AutosaveIndicator } from "@/components/ui/AutosaveIndicator";
import { useAutosave } from "@/lib/useAutosave";
import { formatBRL } from "@/lib/format";
import { gerarEnvelopes, type Envelope } from "@/lib/apfa/calc";
import { PROCESSO_INFO, MEIO_PAGAMENTO_LABEL } from "@/lib/apfa/processos";
import {
  PROCESSO_ORDER,
  type AcompanharData,
  type AvaliarData,
  type LancamentoEnvelope,
  type PlanejarData,
  type ProcessoKey,
  type MotivoDesvio,
} from "@/lib/apfa/types";

const initialState: AcompanharState = {};

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `lc-${Date.now()}-${idCounter}`;
}

export function AcompanharForm({
  cycleId,
  initial,
  percentuaisAtuais,
  pistas,
  planejar,
  avaliar,
}: {
  cycleId: string;
  initial: AcompanharData;
  percentuaisAtuais: Record<ProcessoKey, number>;
  pistas: { reservaSeparada: boolean; cortesPlanejados: string[]; proximaReuniao: string };
  planejar: PlanejarData | null;
  avaliar: AvaliarData | null;
}) {
  const [state, formAction, pending] = useActionState(salvarAcompanharAction, initialState);
  const [porProcesso, setPorProcesso] = useState(initial.por_processo);
  const [reservaSeparada, setReservaSeparada] = useState(initial.reserva_separada);
  const [cortesFeitos, setCortesFeitos] = useState(initial.cortes_feitos);
  const [imprevistos, setImprevistos] = useState(initial.imprevistos);
  const [proximaReuniaoConfirmada, setProximaReuniaoConfirmada] = useState(initial.proxima_reuniao_confirmada);
  // Ciclos salvos antes desse campo existir não têm lancamentos — cai pra lista vazia.
  const [lancamentos, setLancamentos] = useState<LancamentoEnvelope[]>(initial.lancamentos ?? []);

  const [completedAt] = useState(initial.completed_at);
  const payload: AcompanharData = {
    por_processo: porProcesso,
    reserva_separada: reservaSeparada,
    cortes_feitos: cortesFeitos,
    imprevistos,
    proxima_reuniao_confirmada: proximaReuniaoConfirmada,
    lancamentos,
    completed_at: completedAt,
  };

  const autosaveStatus = useAutosave(payload, (draft) => autosalvarAcompanharAction(cycleId, draft));

  const envelopes = useMemo(() => gerarEnvelopes(planejar, avaliar, lancamentos), [planejar, avaliar, lancamentos]);

  function adicionarLancamento(l: Omit<LancamentoEnvelope, "id">) {
    setLancamentos((atual) => [...atual, { ...l, id: newId() }]);
  }
  function atualizarLancamento(id: string, patch: Partial<LancamentoEnvelope>) {
    setLancamentos((atual) => atual.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removerLancamento(id: string) {
    setLancamentos((atual) => atual.filter((l) => l.id !== id));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="acompanhar" value={JSON.stringify(payload)} readOnly />
      <input type="hidden" name="percentuaisAtuais" value={JSON.stringify(percentuaisAtuais)} readOnly />

      <EnvelopesSection
        envelopes={envelopes}
        lancamentos={lancamentos}
        onAdd={adicionarLancamento}
        onUpdate={atualizarLancamento}
        onRemove={removerLancamento}
      />

      <div>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Diagnóstico por processo</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          Para cada processo, o que deu certo vale repetir. Onde não deu, distinga: foi falta de
          execução (deu pra fazer e não fez) ou meta irreal (o número não cabia na vida real)?
        </p>
        <div className="flex flex-col gap-4">
          {PROCESSO_ORDER.map((key) => (
            <Card key={key} className="flex flex-col gap-3">
              <h4 className="font-display-italic font-semibold text-[17px] text-ink">{PROCESSO_INFO[key].titulo}</h4>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] text-ink/70">O que deu certo?</span>
                <textarea
                  rows={2}
                  value={porProcesso[key].deu_certo}
                  onChange={(e) => setPorProcesso({ ...porProcesso, [key]: { ...porProcesso[key], deu_certo: e.target.value } })}
                  className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] text-ink/70">O que não deu certo?</span>
                <textarea
                  rows={2}
                  value={porProcesso[key].nao_deu_certo}
                  onChange={(e) => setPorProcesso({ ...porProcesso, [key]: { ...porProcesso[key], nao_deu_certo: e.target.value } })}
                  className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                />
              </label>
              {porProcesso[key].nao_deu_certo ? (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink/70">Por quê?</span>
                    <select
                      value={porProcesso[key].motivo}
                      onChange={(e) =>
                        setPorProcesso({ ...porProcesso, [key]: { ...porProcesso[key], motivo: e.target.value as MotivoDesvio } })
                      }
                      className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange max-w-xs"
                    >
                      <option value="">Selecione</option>
                      <option value="execucao">Falta de execução — deu pra fazer e não fiz</option>
                      <option value="meta_irreal">Meta irreal — o número não cabia na vida real</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink/70">
                      {porProcesso[key].motivo === "meta_irreal"
                        ? "O que precisa mudar? (vamos recalcular o percentual)"
                        : "O que precisa mudar no comportamento mês que vem?"}
                    </span>
                    <textarea
                      rows={2}
                      value={porProcesso[key].mudanca}
                      onChange={(e) => setPorProcesso({ ...porProcesso, [key]: { ...porProcesso[key], mudanca: e.target.value } })}
                      className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                    />
                  </label>
                  {porProcesso[key].motivo === "meta_irreal" ? (
                    <label className="flex flex-col gap-1.5 max-w-xs">
                      <span className="text-[13px] text-ink/70">Novo percentual ideal para {PROCESSO_INFO[key].titulo}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={porProcesso[key].novo_percentual ?? percentuaisAtuais[key]}
                          onChange={(e) =>
                            setPorProcesso({
                              ...porProcesso,
                              [key]: { ...porProcesso[key], novo_percentual: parseFloat(e.target.value) || 0 },
                            })
                          }
                          className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange w-full"
                        />
                        <span className="text-ink/50">%</span>
                      </div>
                      <span className="text-[12px] text-ink/50">Vale a partir do próximo ciclo — confira a soma no Avaliar.</span>
                    </label>
                  ) : null}
                </>
              ) : null}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Puxando os pilares anteriores</h3>
        <p className="text-ink/60 text-[14px] mb-4">A plataforma já sabe o que foi combinado — só confirme.</p>
        <Card className="flex flex-col gap-5">
          <div>
            <p className="text-[15px] text-ink">
              Do Fazer Acontecer: você marcou que{" "}
              {pistas.reservaSeparada ? "já separou a reserva deste mês." : "ainda não tinha separado a reserva."} A reserva foi
              separada mesmo?
            </p>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="reserva_separada" checked={reservaSeparada === "sim"} onChange={() => setReservaSeparada("sim")} />
                Sim
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="reserva_separada" checked={reservaSeparada === "nao"} onChange={() => setReservaSeparada("nao")} />
                Não
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] text-ink">
              Do Planejar: {pistas.cortesPlanejados.length ? `você disse que ia cortar/cancelar ${pistas.cortesPlanejados.join(", ")}.` : "vocês não marcaram nenhum corte específico."} Isso foi feito mesmo?
            </span>
            <textarea
              rows={2}
              value={cortesFeitos}
              onChange={(e) => setCortesFeitos(e.target.value)}
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] text-ink">Surgiu algum gasto novo este mês (dentista, carro)? Há reserva para isso, ou de onde vai sair?</span>
            <textarea
              rows={2}
              value={imprevistos}
              onChange={(e) => setImprevistos(e.target.value)}
              className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
            />
          </label>

          <div>
            <p className="text-[15px] text-ink">
              Parte técnica: {pistas.proximaReuniao ? `a próxima reunião estava marcada para ${pistas.proximaReuniao}.` : "vocês não marcaram a próxima reunião."} Ela está confirmada?
            </p>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="proxima_reuniao"
                  checked={proximaReuniaoConfirmada === "sim"}
                  onChange={() => setProximaReuniaoConfirmada("sim")}
                />
                Sim
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="proxima_reuniao"
                  checked={proximaReuniaoConfirmada === "nao"}
                  onChange={() => setProximaReuniaoConfirmada("nao")}
                />
                Ainda não
              </label>
            </div>
          </div>
        </Card>
      </div>

      {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Salvando…" : "Fechar o ciclo deste mês →"}
        </Button>
        <AutosaveIndicator status={autosaveStatus} />
      </div>
    </form>
  );
}

function EnvelopesSection({
  envelopes,
  lancamentos,
  onAdd,
  onUpdate,
  onRemove,
}: {
  envelopes: Envelope[];
  lancamentos: LancamentoEnvelope[];
  onAdd: (l: Omit<LancamentoEnvelope, "id">) => void;
  onUpdate: (id: string, patch: Partial<LancamentoEnvelope>) => void;
  onRemove: (id: string) => void;
}) {
  const [itemId, setItemId] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  function registrar() {
    if (!itemId || !valor) return;
    onAdd({ item_id: itemId, valor: parseFloat(valor) || 0, data, descricao });
    setValor("");
    setDescricao("");
  }

  return (
    <div>
      <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Envelopes do mês</h3>
      <p className="text-ink/60 text-[14px] mb-4">
        Cada item que vocês definiram na Organização do mês vira um envelope aqui. Sempre que gastar
        algo, anote — o envelope atualiza sozinho quanto já foi gasto e quanto ainda dá pra gastar.
        Pode ser diário ou semanal, no ritmo que funcionar pra família.
      </p>

      {envelopes.length === 0 ? (
        <Card>
          <p className="text-ink/70 text-[14px]">
            Ainda não há itens na Organização do mês do Planejar — complete essa parte primeiro pra
            liberar os envelopes aqui.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-ink/70">Anotar um gasto</span>
            <div className="grid sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2 items-end">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink/60">Envelope</span>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                >
                  <option value="">Selecione</option>
                  {envelopes.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.nome || "Sem nome"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink/60">Data</span>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink/60">Valor gasto</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
                />
              </label>
              <Button type="button" onClick={registrar} className="shrink-0">
                + Registrar
              </Button>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-ink/60">O que foi (opcional)</span>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: feira da semana"
                className="border border-line bg-cream rounded-lg px-3 py-2 text-[14px] outline-none focus:border-orange"
              />
            </label>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {envelopes.map((env) => (
              <EnvelopeCard
                key={env.id}
                envelope={env}
                lancamentos={lancamentos.filter((l) => l.item_id === env.id)}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EnvelopeCard({
  envelope,
  lancamentos,
  onUpdate,
  onRemove,
}: {
  envelope: Envelope;
  lancamentos: LancamentoEnvelope[];
  onUpdate: (id: string, patch: Partial<LancamentoEnvelope>) => void;
  onRemove: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const sobrou = envelope.orcado > 0 ? (envelope.gasto / envelope.orcado) * 100 : envelope.gasto > 0 ? 100 : 0;
  const estourou = envelope.disponivel < 0;

  return (
    <div className="rounded-xl border border-line p-4 flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex flex-col gap-2.5 text-left w-full bg-transparent border-0 p-0 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-ink text-[15px] truncate">{envelope.nome || "Sem nome"}</span>
          <span className="text-[12px] text-ink/50 shrink-0">
            {MEIO_PAGAMENTO_LABEL[envelope.meioPagamento]}
            {envelope.diaPagamento ? ` · dia ${envelope.diaPagamento}` : ""}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-cream-dark overflow-hidden">
          <div
            className={`h-full rounded-full ${estourou ? "bg-orange-dark" : "bg-sage"}`}
            style={{ width: `${Math.max(0, Math.min(100, sobrou))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-ink/60">
            Gasto: <strong className="text-ink">{formatBRL(envelope.gasto)}</strong>
          </span>
          <span className="text-ink/60">
            Disponível: <strong className={estourou ? "text-orange-dark" : "text-ink"}>{formatBRL(envelope.disponivel)}</strong>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink/40">Orçado: {formatBRL(envelope.orcado)}</span>
          <span className="text-[12px] font-semibold text-orange-dark">
            {lancamentos.length
              ? `${lancamentos.length} lançamento${lancamentos.length === 1 ? "" : "s"}`
              : "Nenhum gasto ainda"}{" "}
            {aberto ? "▲" : "▾"}
          </span>
        </div>
      </button>

      {aberto ? (
        <div className="pt-2.5 border-t border-line flex flex-col gap-2">
          {lancamentos.length === 0 ? (
            <p className="text-[13px] text-ink/50">Nenhum gasto anotado aqui ainda.</p>
          ) : (
            lancamentos.map((l) => (
              <div key={l.id} className="grid grid-cols-[112px_1fr_92px_auto] gap-1.5 items-center">
                <input
                  type="date"
                  value={l.data}
                  onChange={(e) => onUpdate(l.id, { data: e.target.value })}
                  className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-orange"
                />
                <input
                  type="text"
                  value={l.descricao}
                  onChange={(e) => onUpdate(l.id, { descricao: e.target.value })}
                  placeholder="O que foi"
                  className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={l.valor || ""}
                  onChange={(e) => onUpdate(l.id, { valor: parseFloat(e.target.value) || 0 })}
                  className="border border-line bg-cream rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange"
                />
                <button
                  type="button"
                  onClick={() => onRemove(l.id)}
                  aria-label="Remover gasto"
                  className="text-ink/40 hover:text-orange-dark px-1 shrink-0"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
