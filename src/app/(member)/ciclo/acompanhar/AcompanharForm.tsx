"use client";

import { useActionState, useState } from "react";
import { salvarAcompanharAction, type AcompanharState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PROCESSO_INFO } from "@/lib/apfa/processos";
import { PROCESSO_ORDER, type AcompanharData, type ProcessoKey, type MotivoDesvio } from "@/lib/apfa/types";

const initialState: AcompanharState = {};

export function AcompanharForm({
  cycleId,
  initial,
  percentuaisAtuais,
  pistas,
}: {
  cycleId: string;
  initial: AcompanharData;
  percentuaisAtuais: Record<ProcessoKey, number>;
  pistas: { reservaSeparada: boolean; cortesPlanejados: string[]; proximaReuniao: string };
}) {
  const [state, formAction, pending] = useActionState(salvarAcompanharAction, initialState);
  const [porProcesso, setPorProcesso] = useState(initial.por_processo);
  const [reservaSeparada, setReservaSeparada] = useState(initial.reserva_separada);
  const [cortesFeitos, setCortesFeitos] = useState(initial.cortes_feitos);
  const [imprevistos, setImprevistos] = useState(initial.imprevistos);
  const [proximaReuniaoConfirmada, setProximaReuniaoConfirmada] = useState(initial.proxima_reuniao_confirmada);

  const payload: AcompanharData = {
    por_processo: porProcesso,
    reserva_separada: reservaSeparada,
    cortes_feitos: cortesFeitos,
    imprevistos,
    proxima_reuniao_confirmada: proximaReuniaoConfirmada,
    completed_at: null,
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="acompanhar" value={JSON.stringify(payload)} readOnly />
      <input type="hidden" name="percentuaisAtuais" value={JSON.stringify(percentuaisAtuais)} readOnly />

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

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando…" : "Fechar o ciclo deste mês →"}
      </Button>
    </form>
  );
}
