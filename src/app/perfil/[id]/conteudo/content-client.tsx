"use client";

import { useActionState } from "react";
import Link from "next/link";
import { generateContentPieces } from "./actions";
import { Badge, Button, Card } from "@/components/ui";
import type { ContentPiece } from "@/lib/types";

const FORMAT_LABELS: Record<ContentPiece["format"], string> = {
  reels: "Reels",
  carrossel: "Carrossel",
  foto_unica: "Foto única",
  stories: "Stories",
};

export function ContentClient({
  profileId,
  pieces,
}: {
  profileId: string;
  pieces: ContentPiece[];
}) {
  const boundGenerate = generateContentPieces.bind(null, profileId);
  const [state, formAction, pending] = useActionState(boundGenerate, { error: null });

  return (
    <div className="mt-6 space-y-6">
      <form action={formAction} className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Gerando pautas..."
            : pieces.length === 0
              ? "Gerar pautas de conteúdo"
              : "Gerar mais pautas"}
        </Button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>

      {pieces.length > 0 && (
        <>
          <div className="space-y-3">
            {pieces.map((piece) => (
              <Card key={piece.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge>{FORMAT_LABELS[piece.format]}</Badge>
                      {piece.scheduled_date && (
                        <span className="text-xs text-neutral-400">
                          Agendado: {piece.scheduled_date}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-medium">{piece.theme}</h3>
                    {piece.hook && (
                      <p className="mt-1 text-sm text-neutral-600">
                        <span className="font-medium">Gancho:</span> {piece.hook}
                      </p>
                    )}
                    {piece.script && (
                      <p className="mt-1 text-sm text-neutral-600">
                        <span className="font-medium">Roteiro:</span> {piece.script}
                      </p>
                    )}
                    {piece.caption && (
                      <p className="mt-1 text-sm text-neutral-500">
                        <span className="font-medium">Legenda:</span> {piece.caption}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Link href={`/perfil/${profileId}/calendario`}>
            <Button variant="secondary">Ir para o calendário →</Button>
          </Link>
        </>
      )}
    </div>
  );
}
