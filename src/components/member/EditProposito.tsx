"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EditProposito({
  familyId,
  propositoInicial,
  placeholder = "Ex: dar estabilidade pros meus filhos, tirar a família das dívidas, poder confiar no futuro sem medo…",
}: {
  familyId: string;
  propositoInicial: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(!propositoInicial);
  const [texto, setTexto] = useState(propositoInicial);
  const [salvo, setSalvo] = useState(propositoInicial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar() {
    const valor = texto.trim();
    if (valor === salvo) {
      setEditando(false);
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ proposito: valor || null }).eq("id", familyId);
    setPending(false);
    if (error) {
      setError("Não foi possível salvar. Tente de novo.");
      return;
    }
    setSalvo(valor);
    setEditando(false);
    router.refresh();
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          autoFocus
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={salvar}
          placeholder={placeholder}
          disabled={pending}
          className="border border-line bg-cream rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-orange resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={salvar}
            disabled={pending}
            className="text-[13px] font-semibold text-orange-dark hover:underline underline-offset-4 disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
          {salvo ? (
            <button
              type="button"
              onClick={() => {
                setTexto(salvo);
                setEditando(false);
              }}
              className="text-[13px] text-ink/50 hover:text-ink"
            >
              Cancelar
            </button>
          ) : null}
        </div>
        {error ? <span className="text-[13px] text-orange-dark">{error}</span> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="text-left group flex items-start gap-2"
    >
      <span className="text-ink/80 group-hover:text-ink italic">&ldquo;{salvo}&rdquo;</span>
      <span className="text-[12px] text-ink/40 group-hover:text-orange-dark shrink-0 mt-0.5">editar</span>
    </button>
  );
}
