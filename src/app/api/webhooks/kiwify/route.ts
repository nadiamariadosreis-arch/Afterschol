import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Placeholder para a integração futura com a Kiwify.
 *
 * Quando a venda das trilhas 2/3 e do pacote completo estiver ativa na
 * Kiwify, configure o webhook de "compra aprovada" apontando para esta
 * rota. Antes de ativar em produção:
 *
 *  1. Confirme o payload real enviado pela Kiwify (nome dos campos pode
 *     variar por conta/plano) e ajuste o parsing abaixo.
 *  2. Configure `KIWIFY_WEBHOOK_SECRET` no ambiente e valide a assinatura
 *     conforme a documentação da Kiwify para o método de verificação
 *     escolhido (query token, header HMAC, etc.).
 *  3. Preencha `products.kiwify_product_id` (via /admin/produtos ou SQL)
 *     para cada produto, mapeando ao ID do produto na Kiwify.
 *
 * Fluxo implementado: recebe a notificação, localiza o produto pelo
 * `kiwify_product_id`, cria (ou reaproveita) a conta da família por
 * e-mail e concede o entitlement — mesmo efeito de usar
 * "Convidar nova família" no admin, mas automático.
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
  const kiwifyProductId = String(payload?.Product?.product_id ?? payload?.product_id ?? "");
  const status = String(payload?.order_status ?? payload?.status ?? "");

  if (!email || !kiwifyProductId) {
    return NextResponse.json({ error: "Payload incompleto." }, { status: 400 });
  }

  // TODO: confirmar o valor exato usado pela Kiwify para "compra aprovada".
  if (status && status !== "paid" && status !== "approved") {
    return NextResponse.json({ ok: true, skipped: "status não aprovado" });
  }

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("code")
    .eq("kiwify_product_id", kiwifyProductId)
    .maybeSingle();

  if (!product) {
    return NextResponse.json(
      { error: `Nenhum produto mapeado para kiwify_product_id=${kiwifyProductId}` },
      { status: 404 },
    );
  }

  const { data: existing } = await admin.auth.admin.listUsers();
  let userId = existing.users.find((u) => u.email?.toLowerCase() === email)?.id;

  if (!userId) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || undefined },
      redirectTo: `${origin}/redefinir-senha`,
    });
    if (inviteError || !invited.user) {
      return NextResponse.json({ error: "Não foi possível criar a conta da família." }, { status: 500 });
    }
    userId = invited.user.id;
  }

  await admin
    .from("entitlements")
    .upsert(
      { family_id: userId, product_code: product.code, source: "kiwify" },
      { onConflict: "family_id,product_code" },
    );

  return NextResponse.json({ ok: true });
}
