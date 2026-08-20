"use client";

import { useState } from "react";
import { saveMethodAndAdvance } from "./actions";
import { Button, Card, Input, Textarea } from "@/components/ui";
import type { Method, MethodPillar } from "@/lib/types";

export function PillarsForm({ profileId, method }: { profileId: string; method: Method }) {
  const [pillars, setPillars] = useState<MethodPillar[]>(method.pillars);
  const [summary, setSummary] = useState(method.summary ?? "");

  function updatePillar(index: number, patch: Partial<MethodPillar>) {
    setPillars((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function updateProcesses(index: number, text: string) {
    updatePillar(index, {
      processes: text
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    });
  }

  function removePillar(index: number) {
    setPillars((prev) => prev.filter((_, i) => i !== index));
  }

  function addPillar() {
    setPillars((prev) => [...prev, { name: "", description: "", processes: [] }]);
  }

  function downloadSummary() {
    const lines = [
      `Resultado desejado: ${method.desired_result ?? ""}`,
      "",
      "Pilares e processos:",
      ...pillars.flatMap((p) => ["", p.name, p.description, ...p.processes.map((step) => `- ${step}`)]),
      "",
      "Resumo do método:",
      summary,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metodo.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Pilares e processos</h2>
        <Button type="button" variant="ghost" onClick={downloadSummary}>
          Baixar resumo
        </Button>
      </div>

      <div className="space-y-4">
        {pillars.map((pillar, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-line p-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={pillar.name}
                onChange={(e) => updatePillar(index, { name: e.target.value })}
                placeholder="Nome do pilar"
                className="font-medium"
              />
              <button
                type="button"
                onClick={() => removePillar(index)}
                className="shrink-0 text-xs text-ink-soft hover:text-red-600"
              >
                Remover
              </button>
            </div>
            <Textarea
              value={pillar.description}
              onChange={(e) => updatePillar(index, { description: e.target.value })}
              placeholder="O que esse pilar ensina"
              rows={2}
            />
            <Textarea
              value={pillar.processes.join("\n")}
              onChange={(e) => updateProcesses(index, e.target.value)}
              placeholder="Processos/passos, um por linha"
              rows={3}
            />
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addPillar}>
          + Adicionar pilar
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Resumo do método</label>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} />
      </div>

      <form action={saveMethodAndAdvance.bind(null, profileId, method.id)}>
        <input type="hidden" name="pillars_json" value={JSON.stringify(pillars)} readOnly />
        <input type="hidden" name="summary" value={summary} readOnly />
        <Button type="submit">Salvar e avançar para conteúdo</Button>
      </form>
    </Card>
  );
}
