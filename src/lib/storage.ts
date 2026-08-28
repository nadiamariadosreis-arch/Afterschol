import { useCallback, useEffect, useMemo, useState } from "react";
import { hojeISO, toISO } from "./date";

const NS = "casaemordem:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    // localStorage indisponível (modo privado, etc.) — segue sem persistir.
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read<T>(key, initial));

  useEffect(() => {
    write(key, value);
  }, [key, value]);

  const setAndStore = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      return resolved;
    });
  }, []);

  return [value, setAndStore];
}

type ChecklistStore = Record<string, string[]>;

/**
 * Checklist persistido por "bucket" (ex: data do dia, ou chave da semana).
 * Guarda quais ids estão marcados dentro de cada bucket.
 */
export function useBucketChecklist(storageKey: string, bucket: string) {
  const [store, setStore] = useLocalStorage<ChecklistStore>(storageKey, {});

  const checked = useMemo(() => new Set(store[bucket] ?? []), [store, bucket]);

  const toggle = useCallback(
    (id: string) => {
      setStore((prev) => {
        const current = new Set(prev[bucket] ?? []);
        if (current.has(id)) {
          current.delete(id);
        } else {
          current.add(id);
        }
        return { ...prev, [bucket]: Array.from(current) };
      });
    },
    [bucket, setStore],
  );

  const isChecked = useCallback((id: string) => checked.has(id), [checked]);

  return { checked, isChecked, toggle, store };
}

/** Streak de dias consecutivos (terminando hoje) em que todos os ids de `allIds` foram marcados. */
export function useStreak(storageKey: string, allIds: string[], todayISO: string = hojeISO()) {
  const [store] = useLocalStorage<ChecklistStore>(storageKey, {});

  return useMemo(() => {
    if (allIds.length === 0) return 0;
    let streak = 0;
    const d = new Date(`${todayISO}T00:00:00`);
    for (let i = 0; i < 365; i++) {
      const iso = toISO(d);
      const done = store[iso] ?? [];
      const complete = allIds.every((id) => done.includes(id));
      if (!complete) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [store, allIds, todayISO]);
}

export function usePlanoInicio() {
  return useLocalStorage<string | null>("plano-inicio", null);
}

export type PontoPartida = "reset" | "plano21" | "manutencao";

export function usePontoPartida() {
  return useLocalStorage<PontoPartida | null>("ponto-partida", null);
}

/**
 * Lista de tarefas "customizável": parte de uma lista padrão (do método) e permite
 * ao usuário ocultar itens que não fazem sentido pra casa dele, e adicionar os
 * próprios. `groupId` separa listas independentes sob a mesma `key` (ex: uma por
 * zona da casa).
 */
export function useCustomizableList<T extends { id: string; label: string }>(
  key: string,
  groupId: string,
  defaults: T[],
) {
  const [hiddenStore, setHiddenStore] = useLocalStorage<Record<string, string[]>>(`${key}-ocultas`, {});
  const [customStore, setCustomStore] = useLocalStorage<Record<string, T[]>>(`${key}-customizadas`, {});

  const hiddenIds = useMemo(() => new Set(hiddenStore[groupId] ?? []), [hiddenStore, groupId]);
  const customItems = customStore[groupId] ?? [];

  const items = useMemo(
    () => [...defaults.filter((d) => !hiddenIds.has(d.id)), ...customItems],
    [defaults, hiddenIds, customItems],
  );

  const addCustom = useCallback(
    (item: Omit<T, "id">) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setCustomStore((prev) => ({ ...prev, [groupId]: [...(prev[groupId] ?? []), { ...item, id } as T] }));
    },
    [groupId, setCustomStore],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (defaults.some((d) => d.id === id)) {
        setHiddenStore((prev) => ({ ...prev, [groupId]: [...(prev[groupId] ?? []), id] }));
      } else {
        setCustomStore((prev) => ({
          ...prev,
          [groupId]: (prev[groupId] ?? []).filter((c) => c.id !== id),
        }));
      }
    },
    [defaults, groupId, setHiddenStore, setCustomStore],
  );

  const restaurarPadrao = useCallback(() => {
    setHiddenStore((prev) => ({ ...prev, [groupId]: [] }));
  }, [groupId, setHiddenStore]);

  return { items, addCustom, removeItem, restaurarPadrao, temOcultos: hiddenIds.size > 0 };
}
