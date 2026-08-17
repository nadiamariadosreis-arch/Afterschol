"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EditFamilyName({ familyId, nomeInicial }: { familyId: string; nomeInicial: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(nomeInicial);
  const [salvo, setSalvo] = useState(nomeInicial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar() {
    const valor = nome.trim();
    if (!valor || valor === salvo) {
      setNome(salvo);
      setEditando(false);
      return;
    }
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ family_name: valor }).eq("id", familyId);
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
      <div className="flex flex-col gap-1.5">
        <input
          autoFocus
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              salvar();
            }
            if (e.key === "Escape") {
              setNome(salvo);
              setEditando(false);
            }
          }}
          onBlur={salvar}
          disabled={pending}
          className="border border-line bg-cream rounded-lg px-3 py-2 font-body text-ink outline-none focus:border-orange max-w-xs"
        />
        {pending ? <span className="text-[13px] text-ink/50">Salvando…</span> : null}
        {error ? <span className="text-[13px] text-orange-dark">{error}</span> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="text-left group flex items-center gap-2"
    >
      <span className="text-ink/70 underline decoration-dotted underline-offset-4 group-hover:text-ink">
        {salvo || "Sua família"}
      </span>
      <span className="text-[12px] text-ink/40 group-hover:text-orange-dark">editar</span>
    </button>
  );
}
