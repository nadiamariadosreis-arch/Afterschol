"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { Button, Card, Input } from "@/components/ui";

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {
    error: null,
    success: false,
  });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="font-display text-lg font-semibold">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Informe o e-mail da sua conta e enviamos um link para redefinir a senha.
        </p>

        {state.success ? (
          <p className="mt-6 text-sm text-ink">
            Se esse e-mail estiver cadastrado, você vai receber um link em instantes. Confira
            também a caixa de spam.
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail
              </label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/login" className="font-medium text-ink underline">
            Voltar para o login
          </Link>
        </p>
      </Card>
    </main>
  );
}
