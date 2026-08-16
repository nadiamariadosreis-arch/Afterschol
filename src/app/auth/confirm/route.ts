import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o código (?code=) dos links de e-mail (convite, recuperação de
 * senha, confirmação de cadastro) por uma sessão de verdade. Precisa
 * acontecer no servidor: o código PKCE só é válido junto com o
 * "code_verifier" salvo num cookie protegido (httpOnly) na hora em que o
 * e-mail foi disparado — o navegador não consegue ler esse cookie via
 * JavaScript, então a troca teria que ser feita aqui de qualquer forma.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
