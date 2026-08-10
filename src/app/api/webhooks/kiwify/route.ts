import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Placeholder para a integração futura com a Kiwify.
 *
 * Quando a venda da assinatura estiver ativa na Kiwify, configure o
 * webhook de "compra aprovada" apontando para esta rota. Antes de ativar
 * em produção:
 *
 *  1. Confirme o payload real enviado pela Kiwify (nome dos campos pode
 *     variar por conta/plano) e ajuste o parsing abaixo.
 *  2. Configure `KIWIFY_WEBHOOK_SECRET` no ambiente e valide a assinatura
 *     conforme a documentação da Kiwify para o método de verificação
 *     escolhido (query token, header HMAC, etc.).
 *
 * Fluxo implementado: recebe a notificação e convida a conta da família
 * por e-mail — mesmo efeito de usar "Convidar novo membro" no admin, mas
 * automático. Como a plataforma tem uma única assinatura (sem trilhas
 * separadas), toda conta convidada já nasce com acesso completo.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!process.env.KIWIFY_WEBHOOK_SECRET || token !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const payload = await request.json();

  // TODO: ajustar aos nomes de campo reais do webhook da Kiwify.
  const email = String(payload?.Customer?.email ?? payload?.email ?? "").trim().toLowerCase();
  const fullName = String(payload?.Customer?.full_name ?? payload?.full_name ?? "");
  const status = String(payload?.order_status ?? payload?.status ?? "");

  if (!email) {
    return NextResponse.json({ error: "Payload incompleto." }, { status: 400 });
  }

  // TODO: confirmar o valor exato usado pela Kiwify para "compra aprovada".
  if (status && status !== "paid" && status !== "approved") {
    return NextResponse.json({ ok: true, skipped: "status não aprovado" });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin.auth.admin.listUsers();
  const alreadyExists = existing.users.some((u) => u.email?.toLowerCase() === email);

  if (!alreadyExists) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || undefined },
      redirectTo: `${origin}/redefinir-senha`,
    });
    if (inviteError) {
      return NextResponse.json({ error: "Não foi possível criar a conta da família." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
