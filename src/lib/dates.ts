import type { DayOfWeek } from "../types";

export function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

const DAYS_OF_WEEK: DayOfWeek[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function todayDayOfWeek(): DayOfWeek {
  return DAYS_OF_WEEK[new Date().getDay()];
}
