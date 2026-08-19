"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "./actions";
import { Button, Card, Input } from "@/components/ui";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signUp, {
    error: null,
    success: false,
  });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <h1 className="text-lg font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comece a estruturar um Instagram novo do zero.
        </p>

        {state.success ? (
          <p className="mt-6 text-sm text-neutral-700">
            Conta criada. Verifique seu e-mail para confirmar o acesso (se a confirmação
            estiver ativada no projeto) e depois{" "}
            <Link href="/login" className="font-medium underline">
              faça login
            </Link>
            .
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail
              </label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">
                Senha
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
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Criando..." : "Criar conta"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  );
}
