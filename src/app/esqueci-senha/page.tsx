"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ForgotPasswordState } from "../login/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">Redefinir senha</h1>
        </div>

        <Card>
          {state.sent ? (
            <p className="text-ink/80">
              Se este e-mail estiver cadastrado, você vai receber um link para redefinir sua senha
              em instantes.
            </p>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-[15px] text-ink/80">E-mail</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange"
                />
              </label>

              {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

              <Button type="submit" disabled={pending} className="mt-2">
                {pending ? "Enviando…" : "Enviar link de redefinição"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
