import type { BadgeTone } from "@/components/ui/Badge";

// Maps a tag's `type` to a color and label for the UI. New types typed in
// the admin still work (fallback to "muted"/the type's own name), just
// without a dedicated color — add an entry here when a type becomes
// common enough to deserve its own color.

const TYPE_TONE: Record<string, BadgeTone> = {
  queixa: "coral",
  virtude: "teal",
  idade: "rosa",
  tempo: "laranja",
  tipo: "roxo",
  modo: "azul",
};

export const TAG_TYPE_LABELS: Record<string, string> = {
  queixa: "Queixas",
  virtude: "Virtudes",
  idade: "Idade",
  tempo: "Tempo disponível",
  tipo: "Tipo de atividade",
  modo: "Sozinha ou com adulto",
};

export function tagTone(type: string): BadgeTone {
  return TYPE_TONE[type] ?? "muted";
}

export function tagLabel(type: string): string {
  return TAG_TYPE_LABELS[type] ?? type;
}

// Solid-color classes for the big "atalho" shortcut buttons on the
// dashboard — bolder than the outlined Badge pill style.
const TYPE_SOLID: Record<string, string> = {
  queixa: "bg-coral text-white",
  virtude: "bg-teal text-white",
  idade: "bg-rosa text-white",
  tempo: "bg-laranja text-white",
  tipo: "bg-roxo text-white",
  modo: "bg-azul text-white",
};

export function tagSolidClasses(type: string): string {
  return TYPE_SOLID[type] ?? "bg-ink text-white";
}

// Types rendered as big colorful "atalho" buttons on the dashboard —
// quick single-tap entry points. queixa/virtude stay as the finer-grained
// chip filters below them.
export const SHORTCUT_TAG_TYPES = ["idade", "tempo", "tipo", "modo"];
