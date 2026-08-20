import type { SupabaseClient } from "@supabase/supabase-js";

export const LEVEL_TITLES = [
  "Iniciante",
  "Aprendiz",
  "Criador Jr.",
  "Criador",
  "Estrategista",
  "Referência no nicho",
];

export function titleForLevel(level: number) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

/** XP necessário para ir do nível `level` para o `level + 1`. */
export function xpToNextLevel(level: number) {
  return 100 + (level - 1) * 100;
}

export function computeLevel(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  let needed = xpToNextLevel(level);
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpToNextLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needed };
}

export interface ProgressResult {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  streakDays: number;
  leveledUp: boolean;
}

/**
 * Concede XP ao usuário, atualiza a sequência de dias ativos (se a última
 * atividade foi ontem, incrementa; se foi hoje, mantém; caso contrário, reinicia)
 * e retorna o novo estado, incluindo se o usuário subiu de nível nesta chamada.
 */
export async function awardXp(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<ProgressResult> {
  const { data: existing } = await supabase
    .from("user_progress")
    .select("xp, streak_days, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  const todayKey = new Date().toISOString().slice(0, 10);
  const prevXp = existing?.xp ?? 0;
  const prevLevel = computeLevel(prevXp).level;

  let streakDays = existing?.streak_days ?? 0;
  const lastDate = existing?.last_activity_date as string | null | undefined;
  if (lastDate === todayKey) {
    // já ativo hoje, mantém a sequência
  } else if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    streakDays = lastDate === yesterdayKey ? streakDays + 1 : 1;
  } else {
    streakDays = 1;
  }

  const newXp = prevXp + amount;

  await supabase.from("user_progress").upsert({
    user_id: userId,
    xp: newXp,
    streak_days: streakDays,
    last_activity_date: todayKey,
    updated_at: new Date().toISOString(),
  });

  const { level, xpIntoLevel, xpForNextLevel } = computeLevel(newXp);

  return {
    xp: newXp,
    level,
    xpIntoLevel,
    xpForNextLevel,
    streakDays,
    leveledUp: level > prevLevel,
  };
}

/** Anexa os parâmetros de "subiu de nível" a uma URL de redirect, se aplicável. */
export function withLevelUpParam(path: string, progress: ProgressResult) {
  if (!progress.leveledUp) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}levelup=${progress.level}`;
}
