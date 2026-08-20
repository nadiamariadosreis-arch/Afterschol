import type { Category, DayOfWeek, Energy, Frequency } from "../types";

export const categoryMeta: Record<Category, { label: string; emoji: string; classes: string }> = {
  cozinha: { label: "Cozinha", emoji: "🍳", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  limpeza: { label: "Limpeza", emoji: "🧹", classes: "bg-sky-50 text-sky-700 border-sky-200" },
  roupas: { label: "Roupas", emoji: "🧺", classes: "bg-violet-50 text-violet-700 border-violet-200" },
  organizacao: { label: "Organização", emoji: "🗂️", classes: "bg-teal-50 text-teal-700 border-teal-200" },
  financas: { label: "Finanças", emoji: "💰", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  criancas: { label: "Crianças", emoji: "🧒", classes: "bg-pink-50 text-pink-700 border-pink-200" },
  autocuidado: { label: "Autocuidado", emoji: "🌿", classes: "bg-terracotta-50 text-terracotta-600 border-terracotta-100" },
};

export const frequencyMeta: Record<Frequency, string> = {
  diaria: "Diária",
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
};

export const energyMeta: Record<Energy, { label: string; emoji: string }> = {
  baixa: { label: "Baixa energia", emoji: "🪫" },
  media: { label: "Energia normal", emoji: "🔋" },
  alta: { label: "Cheia de energia", emoji: "⚡" },
};

export const timePresets = [15, 30, 45, 60, 90, 120];

export const dayOfWeekMeta: Record<DayOfWeek, string> = {
  dom: "Dom",
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
};

export const daysOfWeekOrder: DayOfWeek[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
