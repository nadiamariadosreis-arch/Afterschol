"use client";

import { useActionState } from "react";
import { generateNicheSuggestions, chooseNiche } from "./actions";
import { Button, Card, Textarea } from "@/components/ui";
import type { Niche } from "@/lib/types";

export function NicheClient({ profileId, latest }: { profileId: string; latest: Niche | null }) {
  const boundGenerate = generateNicheSuggestions.bind(null, profileId);
  const [state, formAction, pending] = useActionState(boundGenerate, { error: null });

  const alreadyChosen = Boolean(latest?.chosen_niche);

  return (
    <div className="mt-6 space-y-6">
      {!alreadyChosen && (
        <form action={formAction} className="space-y-3">
          <Textarea
            name="interest"
            rows={3}
            required
            placeholder="Ex: culinária vegetariana, finanças pessoais, moda plus size, maternidade..."
            defaultValue={latest?.input_interest ?? ""}
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Gerando sugestões..." : "Gerar sugestões de nicho"}
          </Button>
        </form>
      )}

      {latest && latest.suggestions.length > 0 && (
        <div className="space-y-3">
          {alreadyChosen && (
            <p className="text-sm text-neutral-500">
              Nicho escolhido: <span className="font-medium text-neutral-900">{latest.chosen_niche}</span>
            </p>
          )}
          {latest.suggestions.map((suggestion, index) => {
            const isChosen = alreadyChosen && suggestion.niche === latest.chosen_niche;
            return (
              <Card
                key={suggestion.niche + index}
                className={isChosen ? "border-neutral-900" : undefined}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium">{suggestion.niche}</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      <span className="font-medium">Público:</span> {suggestion.audience}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{suggestion.rationale}</p>
                    <p className="mt-1 text-sm text-amber-700">
                      <span className="font-medium">Evite:</span> {suggestion.avoid}
                    </p>
                  </div>
                  {!alreadyChosen && (
                    <form action={chooseNiche.bind(null, profileId, latest.id, index)}>
                      <Button type="submit" variant="secondary">
                        Escolher
                      </Button>
                    </form>
                  )}
                  {isChosen && <span className="text-sm font-medium text-neutral-900">✓ Escolhido</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
