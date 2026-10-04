import type { IgPost, IgPostFormat } from "@/lib/supabase/types";

export const THEMES_PER_ACCOUNT = 6;
export const POSTS_PER_THEME = 5;

export const FORMAT_LABELS: Record<IgPostFormat, string> = {
  carrossel: "Carrossel",
  reels: "Reels",
  estatico: "Post estático",
  stories: "Stories",
};

/** Colunas booleanas do checklist que podem ser marcadas direto na tabela. */
export type ChecklistField =
  | "art_done"
  | "caption_done"
  | "lead_magnet_done"
  | "manychat_done"
  | "product_hosted_done"
  | "checkout_done"
  | "published";

export const CHECKLIST_FIELDS: ChecklistField[] = [
  "art_done",
  "caption_done",
  "lead_magnet_done",
  "manychat_done",
  "product_hosted_done",
  "checkout_done",
  "published",
];

type Step = {
  key: "title" | ChecklistField;
  label: string;
  short: string;
  appliesTo: (post: IgPost) => boolean;
  isDone: (post: IgPost) => boolean;
};

/**
 * Tudo o que precisa acontecer para um post ir ao ar, na ordem. Etapas
 * de isca, ManyChat e produto só contam quando o post usa esses recursos.
 */
export const STEPS: Step[] = [
  {
    key: "title",
    label: "Título definido",
    short: "Título",
    appliesTo: () => true,
    isDone: (p) => p.title.trim().length > 0,
  },
  {
    key: "art_done",
    label: "Arte criada",
    short: "Arte",
    appliesTo: () => true,
    isDone: (p) => p.art_done,
  },
  {
    key: "caption_done",
    label: "Legenda escrita",
    short: "Legenda",
    appliesTo: () => true,
    isDone: (p) => p.caption_done,
  },
  {
    key: "lead_magnet_done",
    label: "Isca / presente pronto",
    short: "Isca",
    appliesTo: (p) => p.uses_lead_magnet,
    isDone: (p) => p.lead_magnet_done,
  },
  {
    key: "manychat_done",
    label: "Fluxo criado no ManyChat",
    short: "ManyChat",
    appliesTo: (p) => p.uses_manychat,
    isDone: (p) => p.manychat_done,
  },
  {
    key: "product_hosted_done",
    label: "Produto hospedado na plataforma",
    short: "Produto",
    appliesTo: (p) => p.sells_product,
    isDone: (p) => p.product_hosted_done,
  },
  {
    key: "checkout_done",
    label: "Checkout configurado",
    short: "Checkout",
    appliesTo: (p) => p.sells_product,
    isDone: (p) => p.checkout_done,
  },
  {
    key: "published",
    label: "Publicado",
    short: "Publicado",
    appliesTo: () => true,
    isDone: (p) => p.published,
  },
];

export function postProgress(post: IgPost) {
  const steps = STEPS.filter((step) => step.appliesTo(post));
  const done = steps.filter((step) => step.isDone(post)).length;
  return { done, total: steps.length, percent: Math.round((done / steps.length) * 100) };
}

export type PostStatus = "ideia" | "producao" | "pronto" | "publicado";

export const STATUS_LABELS: Record<PostStatus, string> = {
  ideia: "Ideia",
  producao: "Em produção",
  pronto: "Pronto para postar",
  publicado: "Publicado",
};

export const STATUS_TONES: Record<PostStatus, "muted" | "gold" | "terracotta" | "moss"> = {
  ideia: "muted",
  producao: "terracotta",
  pronto: "gold",
  publicado: "moss",
};

export function postStatus(post: IgPost): PostStatus {
  if (post.published) return "publicado";
  if (!post.title.trim()) return "ideia";
  const pending = STEPS.filter(
    (step) => step.key !== "published" && step.appliesTo(post) && !step.isDone(post),
  );
  return pending.length === 0 ? "pronto" : "producao";
}

export function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString("pt-BR");
}

export function formatCurrency(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function percent(part: number, whole: number) {
  if (!whole) return "—";
  return `${((part / whole) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
