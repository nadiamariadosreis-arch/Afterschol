import type { ProfileStatus } from "./types";

export const STEP_ORDER: ProfileStatus[] = [
  "nicho",
  "identidade",
  "metodo",
  "conteudo",
  "calendario",
  "ativo",
];

export const STEP_LABELS: Record<ProfileStatus, string> = {
  nicho: "Nicho",
  identidade: "Identidade",
  metodo: "Método",
  conteudo: "Conteúdo",
  calendario: "Calendário",
  ativo: "Ativo",
};

export const STEP_ROUTE: Record<ProfileStatus, string> = {
  nicho: "nicho",
  identidade: "identidade",
  metodo: "metodo",
  conteudo: "conteudo",
  calendario: "calendario",
  ativo: "grid",
};
