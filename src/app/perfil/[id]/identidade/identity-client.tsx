"use client";

import { useActionState, useState } from "react";
import { generateIdentity, saveIdentityEdits, startManualIdentity } from "./actions";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { IdentityPreview } from "./identity-preview";
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
  const [manualPending, setManualPending] = useState(false);

  if (!latest) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-ink-soft">
          Você já tem uma identidade visual pronta (cores, tom de voz), ou quer que a IA sugira
          uma a partir do nicho escolhido?
        </p>
        <div className="flex flex-wrap gap-3">
          <form action={formAction}>
            <Button type="submit" disabled={pending}>
              {pending ? "Gerando identidade..." : "Gerar identidade com IA"}
            </Button>
          </form>
          <form
            action={startManualIdentity.bind(null, profileId)}
            onSubmit={() => setManualPending(true)}
          >
            <Button type="submit" variant="secondary" disabled={manualPending}>
              {manualPending ? "Abrindo..." : "Já tenho, quero preencher a minha"}
            </Button>
          </form>
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    );
  }

  return <IdentityForm profileId={profileId} identity={latest} />;
}

function IdentityForm({ profileId, identity }: { profileId: string; identity: Identity }) {
  const [username, setUsername] = useState(identity.username_suggestion ?? "");
  const [bio, setBio] = useState(identity.bio ?? "");
  const [colors, setColors] = useState<string[]>([
    identity.color_palette[0] ?? "",
    identity.color_palette[1] ?? "",
    identity.color_palette[2] ?? "",
    identity.color_palette[3] ?? "",
  ]);

  function updateColor(index: number, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card>
        <form
          action={saveIdentityEdits.bind(null, profileId, identity.id)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Sugestão de @usuário</label>
              <Input
                name="username_suggestion"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                name="bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Proposta de valor</label>
              <Input name="value_proposition" defaultValue={identity.value_proposition ?? ""} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Tom de voz</label>
              <Textarea name="tone_of_voice" rows={2} defaultValue={identity.tone_of_voice ?? ""} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Pilares de conteúdo (separados por vírgula)</label>
              <Input name="content_pillars" defaultValue={identity.content_pillars.join(", ")} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">
              Paleta de cores {identity.color_palette.length === 0 && "(coloque a sua marca)"}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color || "#e0692b"}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-line bg-transparent p-0.5"
                  />
                  <Input
                    name={`color_${i + 1}`}
                    value={color}
                    onChange={(e) => updateColor(i, e.target.value)}
                    placeholder="#hex"
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit">Salvar e avançar para conteúdo</Button>
        </form>
      </Card>

      <IdentityPreview username={username} bio={bio} colors={colors} />
    </div>
  );
}
