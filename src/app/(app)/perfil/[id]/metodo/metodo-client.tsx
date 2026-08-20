"use client";

import { useActionState } from "react";
import {
  generateMethodStructure,
  removeMethodSource,
  saveMethodNotes,
  uploadMethodSource,
} from "./actions";
import { PillarsForm } from "./pillars-form";
import { Button, Card, Textarea } from "@/components/ui";
import { StaggerItem, StaggerList } from "@/components/motion";
import type { Method, MethodSource } from "@/lib/types";

export function MetodoClient({
  profileId,
  method,
  sources,
}: {
  profileId: string;
  method: Method | null;
  sources: MethodSource[];
}) {
  return (
    <div className="mt-6 space-y-6">
      <NotesCard profileId={profileId} method={method} />
      <SourcesCard profileId={profileId} method={method} sources={sources} />
      {method?.desired_result && <GenerateCard profileId={profileId} method={method} />}
      {method && method.pillars.length > 0 && (
        <PillarsForm key={method.updated_at} profileId={profileId} method={method} />
      )}
    </div>
  );
}

function NotesCard({ profileId, method }: { profileId: string; method: Method | null }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Sobre o seu método</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Conte o que você ensina no seu produto pago. Pode digitar ou usar o microfone do
          teclado do celular para ditar.
        </p>
      </div>
      <form key={method?.id ?? "new"} action={saveMethodNotes.bind(null, profileId)} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Qual resultado esse conteúdo gratuito deve entregar (o gancho para o seu produto)?
          </label>
          <Textarea
            name="desired_result"
            rows={2}
            defaultValue={method?.desired_result ?? ""}
            placeholder="Ex: ensinar o básico para a pessoa perceber que sozinha ela só resolve parte do problema"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Notas livres sobre o método/produto pago</label>
          <Textarea
            name="notes"
            rows={6}
            defaultValue={method?.notes ?? ""}
            placeholder="Descreva os ensinamentos, a estrutura, o estilo (ex: perguntas e respostas) usado no seu material pago"
          />
        </div>
        <Button type="submit">Salvar notas</Button>
      </form>
    </Card>
  );
}

function SourcesCard({
  profileId,
  method,
  sources,
}: {
  profileId: string;
  method: Method | null;
  sources: MethodSource[];
}) {
  const boundUpload = uploadMethodSource.bind(null, profileId);
  const [state, formAction, pending] = useActionState(boundUpload, { error: null });

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Materiais em PDF</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Envie um PDF do seu curso, apostila ou material pago. A IA lê e resume o conteúdo para
          usar como referência.
        </p>
      </div>

      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          disabled={!method}
          className="text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-orange-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-orange-dark"
        />
        <Button type="submit" disabled={pending || !method}>
          {pending ? "Enviando e resumindo..." : "Enviar PDF"}
        </Button>
        {!method && <p className="text-xs text-ink-soft">Salve as notas primeiro.</p>}
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {sources.length > 0 && (
        <StaggerList className="space-y-2">
          {sources.map((source) => (
            <StaggerItem key={source.id}>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-line bg-cream-dark p-3">
                <div>
                  <p className="text-sm font-medium">{source.title}</p>
                  {source.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{source.summary}</p>
                  )}
                </div>
                <form action={removeMethodSource.bind(null, profileId, source.id, source.file_path)}>
                  <button type="submit" className="shrink-0 text-xs text-ink-soft hover:text-red-600">
                    Remover
                  </button>
                </form>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </Card>
  );
}

function GenerateCard({ profileId, method }: { profileId: string; method: Method }) {
  const boundGenerate = generateMethodStructure.bind(null, profileId);
  const [state, formAction, pending] = useActionState(boundGenerate, { error: null });

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Estrutura do método</h2>
          <p className="mt-1 text-sm text-ink-soft">
            A IA organiza suas notas e materiais em pilares e processos prontos para virar
            conteúdo.
          </p>
        </div>
        <form action={formAction}>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Gerando estrutura..."
              : method.pillars.length > 0
                ? "Gerar novamente"
                : "Gerar estrutura com IA"}
          </Button>
        </form>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </Card>
  );
}
