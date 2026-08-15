import type { AutosaveStatus } from "@/lib/useAutosave";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  const label =
    status === "saving"
      ? "Salvando rascunho…"
      : status === "saved"
        ? "Rascunho salvo automaticamente ✓"
        : "Não foi possível salvar o rascunho agora";

  return <p className={`text-[13px] ${status === "error" ? "text-orange-dark" : "text-ink/45"}`}>{label}</p>;
}
