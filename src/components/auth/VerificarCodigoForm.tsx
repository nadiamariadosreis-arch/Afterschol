"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Confirma o código recebido por e-mail (recuperação de senha, convite ou
 * confirmação de cadastro) em vez de depender de um link clicável — apps de
 * e-mail (o Gmail no Android é o mais comum) às vezes abrem o link sozinhos
 * pra escanear se é seguro antes da pessoa clicar, o que "gasta" o link de
 * uso único antes da hora. Um código digitado manualmente não tem esse
 * problema, porque nada consegue "clicar" nele sozinho.
 */
export function VerificarCodigoForm({
  tipo,
  emailInicial = "",
  pedirEmail = true,
  destino,
  descricao,
}: {
  tipo: EmailOtpType;
  emailInicial?: string;
  pedirEmail?: boolean;
  destino: string;
  descricao: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(emailInicial);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: tipo });
      if (error) {
        setError("Código inválido ou expirado. Confira e tente de novo, ou peça um novo.");
        return;
      }
      router.push(destino);
    } catch {
      setError("Não foi possível confirmar o código. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-ink/80 text-[15px]">{descricao}</p>

      {pedirEmail ? (
        <label className="flex flex-col gap-2">
          <span className="text-[15px] text-ink/80">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="text-[15px] text-ink/80">Código recebido por e-mail</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={12}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange tracking-[0.3em] text-center text-[20px]"
        />
      </label>

      {error ? <p className="text-orange-dark text-[15px]">{error}</p> : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Confirmando…" : "Confirmar código"}
      </Button>
    </form>
  );
}
