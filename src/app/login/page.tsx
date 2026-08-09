"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3">
            Área de Membros
          </div>
          <h1 className="font-display italic font-semibold text-[36px] text-ink">
            Bem-vinda de volta
          </h1>
        </div>

        <Card>
          <form action={formAction} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] text-ink/80">E-mail</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="border border-line bg-parchment rounded-sm px-4 py-2.5 font-body text-ink outline-none focus:border-moss"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[15px] text-ink/80">Senha</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="border border-line bg-parchment rounded-sm px-4 py-2.5 font-body text-ink outline-none focus:border-moss"
              />
            </label>

            {state.error ? (
              <p className="text-terracotta text-[15px]">{state.error}</p>
            ) : null}

            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-[15px] text-ink/70">
          <Link href="/esqueci-senha" className="text-navy underline underline-offset-4">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </main>
  );
}
