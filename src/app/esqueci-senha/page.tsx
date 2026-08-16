"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VerificarCodigoForm } from "@/components/auth/VerificarCodigoForm";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [pending, setPending] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setDebugError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      // TODO: remover esse aviso depois de confirmar por que o envio às vezes falha.
      if (error) setDebugError(`${error.message} (status ${error.status ?? "?"})`);
    } catch (e) {
      setDebugError(e instanceof Error ? e.message : "erro desconhecido");
    } finally {
      setPending(false);
      // Sempre avança, mesmo se der erro — não revela quais e-mails estão cadastrados.
      setEnviado(true);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">Redefinir senha</h1>
        </div>

        <Card>
          {enviado ? (
            <>
              {debugError ? (
                <p className="text-orange-dark text-[13px] mb-4 break-words">[debug] {debugError}</p>
              ) : null}
              <VerificarCodigoForm
                tipo="recovery"
                emailInicial={email}
                pedirEmail={false}
                destino="/redefinir-senha"
                descricao={`Se ${email} estiver cadastrado, chega um código de 6 dígitos em instantes. Digite ele abaixo.`}
              />
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              <Button type="submit" disabled={pending} className="mt-2">
                {pending ? "Enviando…" : "Enviar código"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
