"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="font-display text-lg font-semibold">Nova senha</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Escolha uma nova senha para sua conta.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Nova senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="confirm">
              Confirmar senha
            </label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
