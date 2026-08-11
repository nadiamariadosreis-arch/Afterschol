"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setStatus(error ? "error" : "done");
    if (!error) setPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <input
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-line bg-parchment rounded-sm px-4 py-2.5 font-body text-ink outline-none focus:border-moss"
      />
      {status === "done" ? <p className="text-moss text-[15px]">Senha atualizada.</p> : null}
      {status === "error" ? (
        <p className="text-terracotta text-[15px]">Não foi possível salvar. Tente novamente.</p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
