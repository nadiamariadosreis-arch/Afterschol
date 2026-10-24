"use client";

import { useSyncExternalStore } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { DEFAULT_STATE, type PainelState } from "./data";

const KEY = "painel-regra-sao-bento-v1";

let cache: PainelState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function snapshot(): PainelState {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) cache = { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      // storage bloqueado ou JSON inválido: segue com o padrão em memória
    }
  }
  return cache;
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function update(fn: (s: PainelState) => PainelState) {
  cache = fn(snapshot());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // sem persistência, mas a sessão continua funcionando
  }
  emit();
}

export function usePainel(): PainelState {
  return useSyncExternalStore(subscribe, snapshot, () => DEFAULT_STATE);
}

const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function subscribeNow(cb: () => void) {
  const id = setInterval(cb, 15000);
  return () => clearInterval(id);
}
export function useNow(): Date {
  const minutes = useSyncExternalStore(subscribeNow, () => Math.floor(Date.now() / 60000), () => 0);
  return new Date(minutes * 60000);
}

// ─── Utilidades ───────────────────────────────────────────────────────────

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const ymd = (d: Date) => format(d, "yyyy-MM-dd");
export const weekStartOf = (d: Date) => startOfWeek(d, { weekStartsOn: 1 });
export const weekDays = (d: Date) => {
  const start = weekStartOf(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export function toggleCheck(key: string) {
  update((s) => {
    const checks = { ...s.checks };
    if (checks[key]) delete checks[key];
    else checks[key] = true;
    return { ...s, checks };
  });
}

export function addTarefa(text: string, area: import("./data").AreaId, date: string) {
  const t = text.trim();
  if (!t) return;
  update((s) => ({ ...s, tarefas: [...s.tarefas, { id: uid(), text: t, area, date, done: false }] }));
}
