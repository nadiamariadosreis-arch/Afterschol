"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "./actions";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="font-display text-lg font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Acesse sua conta para continuar estruturando seu Instagram.
        </p>
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
              autoComplete="current-password"
            />
            <p className="text-right text-xs">
              <Link href="/esqueci-senha" className="text-ink-soft underline hover:text-ink">
                Esqueci minha senha
              </Link>
            </p>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-ink underline">
            Criar conta
          </Link>
        </p>
      </Card>
    </main>
  );
}
