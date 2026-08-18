import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccessToCatalog } from "@/lib/entitlements";
import { watermarkPdf } from "@/lib/watermark";
import type { Material, ProductCode } from "@/lib/supabase/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> },
) {
  const { materialId } = await params;
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

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .returns<Material[]>()
    .maybeSingle();
  if (!material) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });

  if (profile.role !== "admin") {
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("product_code")
      .eq("family_id", profile.id);
    const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];

    if (!hasAccessToCatalog(entitlementCodes)) {
      return NextResponse.json({ error: "Sem acesso ao portal." }, { status: 403 });
    }
  }

  if (!material.pdf_path) {
    return NextResponse.json({ error: "Arquivo não disponível." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from("content").download(material.pdf_path);
  if (error || !file) {
    return NextResponse.json({ error: "Não foi possível carregar o arquivo." }, { status: 500 });
  }

  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const label = `${profile.full_name ?? profile.email} · ${profile.email}`;
  const watermarked = await watermarkPdf(originalBytes, label);

  const filename = `${material.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

  return new NextResponse(Buffer.from(watermarked), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
