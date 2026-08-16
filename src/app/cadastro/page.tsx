"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VerificarCodigoForm } from "@/components/auth/VerificarCodigoForm";

const initialState: SignupState = {};

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-3">
            Criar conta
          </div>
          <h1 className="font-display-italic font-semibold text-[36px] text-ink">Comece seu ciclo</h1>
        </div>

        <Card>
          {state.confirmEmail ? (
            <VerificarCodigoForm
              tipo="signup"
              emailInicial={state.email}
              pedirEmail={false}
              destino="/dashboard"
              descricao="Quase lá! Mandamos um código de 6 dígitos pro seu e-mail — digite ele abaixo pra ativar sua conta."
            />
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-[15px] text-ink/80">Como podemos chamar sua família?</span>
                <input
                  type="text"
                  name="familyName"
                  required
                  placeholder="Ex: Família Silva"
                  className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange"
                />
              </label>
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
              <label className="flex flex-col gap-2">
                <span className="text-[15px] text-ink/80">Senha</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="border border-line bg-cream rounded-xl px-4 py-2.5 font-body text-ink outline-none focus:border-orange"
                />
              </label>

              {state.error ? <p className="text-orange-dark text-[15px]">{state.error}</p> : null}

              <Button type="submit" disabled={pending} className="mt-2">
                {pending ? "Criando conta…" : "Criar minha conta"}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center mt-6 text-[15px] text-ink/70">
          <Link href="/login" className="text-orange-dark underline underline-offset-4 font-semibold">
            Já tenho conta — entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
