"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // O link do e-mail chega com um código (?code=) que precisa ser trocado
  // por uma sessão antes de dar pra alterar a senha — sem isso, updateUser
  // fica sem sessão pra agir e a troca de senha nunca completa.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) setLinkError("Este link expirou ou já foi usado. Solicite um novo.");
        else window.history.replaceState(null, "", window.location.pathname);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError("Não foi possível redefinir a senha. Solicite um novo link.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Não foi possível redefinir a senha. Solicite um novo link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">Defina sua nova senha</h1>
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
                className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange"
              />
            </label>

            {linkError ? <p className="text-orange-dark text-[15px]">{linkError}</p> : null}
            {error ? <p className="text-orange-dark text-[15px]">{error}</p> : null}

            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
