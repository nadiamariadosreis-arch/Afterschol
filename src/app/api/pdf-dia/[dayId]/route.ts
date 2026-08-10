import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccessToTrack } from "@/lib/entitlements";
import { watermarkPdf } from "@/lib/watermark";
import type { ProductCode, Track, Week, WeekDay } from "@/lib/supabase/types";

type WeekDayWithRelations = WeekDay & { weeks: Week & { tracks: Track } };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> },
) {
  const { dayId } = await params;
  const mode = request.nextUrl.searchParams.get("mode"); // "download" | null

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

  const { data: day } = await supabase
    .from("week_days")
    .select("*, weeks(*, tracks(*))")
    .eq("id", dayId)
    .returns<WeekDayWithRelations[]>()
    .maybeSingle();
  if (!day) return NextResponse.json({ error: "Dia não encontrado." }, { status: 404 });

  const week = day.weeks;
  const track = week.tracks;

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

  if (!day.pdf_path) {
    return NextResponse.json({ error: "Arquivo não disponível." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from("content").download(day.pdf_path);
  if (error || !file) {
    return NextResponse.json({ error: "Não foi possível carregar o arquivo." }, { status: 500 });
  }

  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const label = `${profile.full_name ?? profile.email} · ${profile.email}`;
  const watermarked = await watermarkPdf(originalBytes, label);

  const filename = `${day.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-semana-${week.week_number}.pdf`;

  return new NextResponse(Buffer.from(watermarked), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
