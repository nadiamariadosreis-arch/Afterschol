import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccessToTrack } from "@/lib/entitlements";
import { watermarkPdf } from "@/lib/watermark";
import type { ProductCode, Track, Virtue, Week } from "@/lib/supabase/types";

type WeekWithRelations = Week & { tracks: Track; virtues: Virtue | null };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekId: string }> },
) {
  const { weekId } = await params;
  const type = request.nextUrl.searchParams.get("type"); // "booklet" | "activity"
  const mode = request.nextUrl.searchParams.get("mode"); // "download" | null

  if (type !== "booklet" && type !== "activity") {
    return NextResponse.json({ error: "Parâmetro 'type' inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 403 });

  const { data: week } = await supabase
    .from("weeks")
    .select("*, tracks(*), virtues(*)")
    .eq("id", weekId)
    .returns<WeekWithRelations[]>()
    .maybeSingle();
  if (!week) return NextResponse.json({ error: "Semana não encontrada." }, { status: 404 });

  const track = week.tracks;
  const virtue = week.virtues;

  if (profile.role !== "admin") {
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("product_code")
      .eq("family_id", profile.id);
    const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];

    if (!hasAccessToTrack(entitlementCodes, track)) {
      return NextResponse.json({ error: "Sem acesso a esta trilha." }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (week.release_date > today) {
      return NextResponse.json({ error: "Conteúdo ainda não liberado." }, { status: 403 });
    }
  }

  const storagePath = type === "booklet" ? virtue?.booklet_pdf_path : week.activity_pdf_path;
  if (!storagePath) {
    return NextResponse.json({ error: "Arquivo não disponível." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from("content").download(storagePath);
  if (error || !file) {
    return NextResponse.json({ error: "Não foi possível carregar o arquivo." }, { status: 500 });
  }

  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const label = `${profile.full_name ?? profile.email} · ${profile.email}`;
  const watermarked = await watermarkPdf(originalBytes, label);

  const filename = `${type === "booklet" ? "livrinho" : "atividade"}-semana-${week.week_number}.pdf`;

  return new NextResponse(Buffer.from(watermarked), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
