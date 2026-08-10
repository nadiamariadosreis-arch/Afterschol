import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToTrack } from "@/lib/entitlements";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { generateCertificate } from "@/lib/certificate";
import type { ProductCode } from "@/lib/supabase/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackSlug: string }> },
) {
  const { trackSlug } = await params;

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

  const activeChildId = await getActiveChildProfileId();
  if (!activeChildId) {
    return NextResponse.json({ error: "Selecione um perfil de criança." }, { status: 400 });
  }

  const { data: child } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("id", activeChildId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: "Perfil de criança não encontrado." }, { status: 404 });

  const { data: track } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", trackSlug)
    .maybeSingle();
  if (!track) return NextResponse.json({ error: "Trilha não encontrada." }, { status: 404 });

  if (profile.role !== "admin") {
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("product_code")
      .eq("family_id", profile.id);
    const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];

    if (!hasAccessToTrack(entitlementCodes, track)) {
      return NextResponse.json({ error: "Sem acesso a esta trilha." }, { status: 403 });
    }
  }

  const { data: weeks } = await supabase.from("weeks").select("id").eq("track_id", track.id);
  const weekIds = (weeks ?? []).map((w) => w.id);

  if (weekIds.length === 0) {
    return NextResponse.json({ error: "Trilha ainda sem semanas cadastradas." }, { status: 404 });
  }

  const { data: progressRows } = await supabase
    .from("progress")
    .select("completed_at")
    .eq("child_profile_id", activeChildId)
    .in("week_id", weekIds)
    .not("completed_at", "is", null);

  const completedDates = (progressRows ?? [])
    .map((p) => p.completed_at)
    .filter((d): d is string => Boolean(d));

  if (completedDates.length < weekIds.length) {
    return NextResponse.json(
      { error: "Ainda faltam semanas para concluir esta trilha." },
      { status: 409 },
    );
  }

  const completedAt = completedDates
    .map((d) => new Date(d))
    .reduce((latest, d) => (d > latest ? d : latest), new Date(0));

  const pdfBytes = await generateCertificate({
    childName: child.name,
    trackName: track.name,
    weeksCompleted: weekIds.length,
    completedAt,
  });

  const slug = child.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${track.slug}-${slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
