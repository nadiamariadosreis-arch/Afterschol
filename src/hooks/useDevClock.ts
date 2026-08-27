import { useEffect, useState } from "react";
import { addDaysISO, todayISO } from "../lib/dates";

const KEY = "rotina-mamae:desafio:devclock:v1";

function loadOffset(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Relógio de teste — deixa "andar" pelos dias do desafio sem esperar dias
 * reais passarem, pra dar pra testar a rotação de zona e o painel de 21
 * dias numa sentada só. Não faz parte do produto pra clientes; é só um
 * atalho de dogfooding.
 */
export function useDevClock() {
  const [offsetDays, setOffsetDays] = useState<number>(loadOffset);

  useEffect(() => localStorage.setItem(KEY, String(offsetDays)), [offsetDays]);

  const today = addDaysISO(todayISO(), offsetDays);

  return {
    today,
    offsetDays,
    advanceDay: () => setOffsetDays((o) => o + 1),
    rewindDay: () => setOffsetDays((o) => Math.max(0, o - 1)),
    resetToToday: () => setOffsetDays(0),
  };
}
