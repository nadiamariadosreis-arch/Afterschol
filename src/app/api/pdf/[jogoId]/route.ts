import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { watermarkPdf } from "@/lib/watermark";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jogoId: string }> },
) {
  const { jogoId } = await params;
  const mode = request.nextUrl.searchParams.get("mode"); // "download" | null

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 403 });

  const { data: jogo } = await supabase.from("jogos").select("*").eq("id", jogoId).maybeSingle();
  if (!jogo) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });

  if (!jogo.published && profile.role !== "admin") {
    return NextResponse.json({ error: "Jogo não disponível." }, { status: 403 });
  }

  if (!jogo.pdf_path) {
    return NextResponse.json({ error: "Arquivo não disponível." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from("jogos-pdf").download(jogo.pdf_path);
  if (error || !file) {
    return NextResponse.json({ error: "Não foi possível carregar o arquivo." }, { status: 500 });
  }

  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const label = `${profile.full_name ?? profile.email} · ${profile.email}`;
  const watermarked = await watermarkPdf(originalBytes, label);

  const filename = `${jogo.slug}.pdf`;

  return new NextResponse(Buffer.from(watermarked), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
