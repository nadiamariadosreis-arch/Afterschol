"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setPending(false);

    if (error) {
      setError("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display italic font-semibold text-[32px] text-ink">
            Defina sua nova senha
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] text-ink/80">Nova senha</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-line bg-parchment rounded-sm px-4 py-2.5 font-body text-ink outline-none focus:border-moss"
              />
            </label>

            {error ? <p className="text-terracotta text-[15px]">{error}</p> : null}

            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
