"use client";

import { useActionState } from "react";
import { generateIdentity, saveIdentityEdits } from "./actions";
import { Button, Card, Input, Textarea } from "@/components/ui";
import type { Identity } from "@/lib/types";

export function IdentityClient({
  profileId,
  latest,
}: {
  profileId: string;
  latest: Identity | null;
}) {
  const boundGenerate = generateIdentity.bind(null, profileId);
  const [state, formAction, pending] = useActionState(boundGenerate, { error: null });

  if (!latest) {
    return (
      <div className="mt-6 space-y-3">
        <form action={formAction}>
          {state.error && <p className="mb-3 text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Gerando identidade..." : "Gerar identidade com IA"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <form action={saveIdentityEdits.bind(null, profileId, latest.id)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Sugestão de @usuário</label>
            <Input name="username_suggestion" defaultValue={latest.username_suggestion ?? ""} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea name="bio" rows={2} defaultValue={latest.bio ?? ""} maxLength={150} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Proposta de valor</label>
            <Input name="value_proposition" defaultValue={latest.value_proposition ?? ""} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Tom de voz</label>
            <Textarea name="tone_of_voice" rows={2} defaultValue={latest.tone_of_voice ?? ""} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Pilares de conteúdo (separados por vírgula)</label>
            <Input
              name="content_pillars"
              defaultValue={latest.content_pillars.join(", ")}
            />
          </div>
        </div>

        {latest.color_palette.length > 0 && (
          <div>
            <p className="text-sm font-medium">Paleta sugerida</p>
            <div className="mt-2 flex gap-2">
              {latest.color_palette.map((color) => (
                <div key={color} className="flex flex-col items-center gap-1">
                  <span
                    className="h-8 w-8 rounded-full border border-line"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-ink-soft">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit">Salvar e avançar para conteúdo</Button>
      </form>
    </Card>
  );
}
