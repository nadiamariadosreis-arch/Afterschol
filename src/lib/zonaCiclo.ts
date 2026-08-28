import { useCallback, useMemo } from "react";
import { zonas as zonasPadrao } from "../data/method";
import { useLocalStorage } from "./storage";
import { hojeISO, indiceSemana } from "./date";

interface Ancora {
  data: string;
  zonaId: number;
}

const IDS_PADRAO = zonasPadrao.map((z) => z.semana);

/**
 * Controla o ciclo dos cômodos da semana: a ordem em que eles se repetem
 * (customizável, cada casa tem uma realidade diferente) e qual deles é
 * "essa semana" — definido manualmente pelo usuário, avançando sozinho a
 * partir dali a cada semana corrida, até a pessoa apontar outro.
 */
export function useCicloZonas() {
  const [ordemBruta, setOrdemBruta] = useLocalStorage<number[]>("zonas-ordem", IDS_PADRAO);
  const [ancora, setAncora] = useLocalStorage<Ancora>("zonas-ancora", {
    data: hojeISO(),
    zonaId: IDS_PADRAO[0],
  });

  // Normaliza: se os dados do método mudarem (zona removida/adicionada), não quebra.
  const ordem = useMemo(() => {
    const validos = ordemBruta.filter((id) => IDS_PADRAO.includes(id));
    const faltando = IDS_PADRAO.filter((id) => !validos.includes(id));
    return [...validos, ...faltando];
  }, [ordemBruta]);

  const zonaAtualId = useMemo(() => {
    const n = ordem.length;
    const base = ordem.indexOf(ancora.zonaId);
    const baseIdx = base === -1 ? 0 : base;
    const semanasPassadas = indiceSemana(hojeISO()) - indiceSemana(ancora.data);
    const efetivo = (((baseIdx + semanasPassadas) % n) + n) % n;
    return ordem[efetivo];
  }, [ordem, ancora]);

  const posicaoDe = useCallback((zonaId: number) => ordem.indexOf(zonaId) + 1, [ordem]);

  const definirAtual = useCallback(
    (zonaId: number) => setAncora({ data: hojeISO(), zonaId }),
    [setAncora],
  );

  const mover = useCallback(
    (zonaId: number, direcao: -1 | 1) => {
      setOrdemBruta(() => {
        const lista = [...ordem];
        const i = lista.indexOf(zonaId);
        const j = i + direcao;
        if (i === -1 || j < 0 || j >= lista.length) return lista;
        [lista[i], lista[j]] = [lista[j], lista[i]];
        return lista;
      });
    },
    [ordem, setOrdemBruta],
  );

  return { ordem, zonaAtualId, posicaoDe, definirAtual, mover };
}
