import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook da Kiwify — libera o acesso completo (Planejar, Fazer Acontecer,
 * Acompanhar) na compra aprovada, por 1 ano a partir da data da compra (ver
 * `temAcessoPago` em src/lib/auth.ts). O Avaliar é gratuito e não depende
 * disso: qualquer conta criada em /cadastro já acessa o Pilar 1.
 *
 * A Kiwify não manda um campo de "status" genérico pra filtrar — é o
 * próprio evento escolhido no painel dela que decide quando ela chama essa
 * rota (Produto → Webhooks → Criar webhook). Configure o webhook para
 * disparar **só** no evento "Compra aprovada" — não marque os outros
 * (recusada, reembolsada, chargeback etc.), senão esta rota vai liberar
 * acesso indevidamente.
 *
 * Antes de ativar em produção:
 *
 *  1. Confirme o payload real enviado pela Kiwify (nome dos campos pode
 *     variar por conta/plano) e ajuste o parsing abaixo — o `Customer.email`
 *     e `Customer.full_name` usados aqui já batem com o formato documentado.
 *  2. Configure `KIWIFY_WEBHOOK_SECRET` no ambiente e valide a assinatura
 *     conforme a documentação da Kiwify para o método de verificação
 *     escolhido (query token, header HMAC, etc.).
 *
 * Fluxo: se a família já tem conta (criada de graça em /cadastro antes de
 * comprar), só marca `paid = true`. Se não tem conta ainda, convida por
 * e-mail — a conta nasce em `public.profiles` pelo trigger
 * `on_auth_user_created` assim que ela definir a senha pelo link do
 * convite — e já marca `paid = true` na hora.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!process.env.KIWIFY_WEBHOOK_SECRET || token !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  // O botão de "testar webhook" da Kiwify (e reenvios automáticos dela)
  // podem mandar o corpo vazio ou fora do formato esperado — nesses casos
  // respondemos 200 (sem fazer nada) em vez de quebrar com erro 500.
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true, skipped: "corpo vazio ou não é JSON (provável teste)" });
  }

  try {
    const email = String(payload?.Customer?.email ?? payload?.email ?? "").trim().toLowerCase();
    const familyName = String(payload?.Customer?.full_name ?? payload?.full_name ?? "");

    if (!email) {
      return NextResponse.json({ error: "Payload incompleto." }, { status: 400 });
    }

    // Defesa extra, caso o mesmo webhook também esteja marcado para outros
    // eventos além de "Compra aprovada": se vier um campo de status/evento
    // reconhecível e ele indicar algo diferente de aprovado, ignora.
    const statusOuEvento = String(
      payload?.order_status ?? payload?.status ?? payload?.webhook_event_type ?? payload?.event ?? "",
    ).toLowerCase();
    const REPROVADOS = ["recusada", "refused", "reembolsada", "refunded", "chargeback", "cancelado", "canceled"];
    if (statusOuEvento && REPROVADOS.some((termo) => statusOuEvento.includes(termo))) {
      return NextResponse.json({ ok: true, skipped: "evento não é compra aprovada" });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin.auth.admin.listUsers();
    const existingUser = existing.users.find((u) => u.email?.toLowerCase() === email);

    let userId = existingUser?.id;

    if (!userId) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { family_name: familyName || undefined },
        redirectTo: `${origin}/redefinir-senha`,
      });
      if (inviteError || !invited.user) {
        console.error("Kiwify webhook: falha ao convidar família", inviteError);
        return NextResponse.json({ error: "Não foi possível criar a conta da família." }, { status: 500 });
      }
      userId = invited.user.id;
    }

    // O acesso pago vale 1 ano a partir de agora — inclusive numa renovação
    // feita antes de vencer, o que dá um ano cheio a partir da nova compra.
    const paidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const { error: updateError } = await admin
      .from("profiles")
      .update({ paid: true, paid_until: paidUntil })
      .eq("id", userId);
    if (updateError) {
      console.error("Kiwify webhook: falha ao liberar acesso", updateError);
      return NextResponse.json({ error: "Não foi possível liberar o acesso." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Kiwify webhook: erro inesperado", err);
    return NextResponse.json({ error: "Erro inesperado ao processar o webhook." }, { status: 500 });
  }
}
