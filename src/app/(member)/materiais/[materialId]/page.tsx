import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToCatalog } from "@/lib/entitlements";
import { toEmbedUrl } from "@/lib/video";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import { GuideContent } from "@/components/member/GuideContent";
import type { Category, Material, ProductCode } from "@/lib/supabase/types";

type MaterialWithCategory = Material & { categories: Pick<Category, "id" | "name"> | null };

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  const profile = await requireFamily();

  const supabase = await createClient();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_code")
    .eq("family_id", profile.id);
  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  if (!hasAccessToCatalog(entitlementCodes)) redirect("/dashboard");

  const { data: material } = await supabase
    .from("materials")
    .select("*, categories(id, name)")
    .eq("id", materialId)
    .returns<MaterialWithCategory[]>()
    .maybeSingle();
  if (!material) notFound();

  const backHref = material.categories ? `/categorias/${material.categories.id}` : "/dashboard";

  return (
    <div className="flex flex-col gap-8">
      <Link href={backHref} className="text-navy text-[14px] hover:underline underline-offset-4 w-fit">
        ← {material.categories ? `Voltar para ${material.categories.name}` : "Voltar ao catálogo"}
      </Link>

      <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
          <Cover
            trackSlug={material.id}
            mark={material.title.charAt(0)}
            imageUrl={coverImageUrl(material.cover_image_path)}
            className="absolute inset-0 w-full h-full rounded-none"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {material.categories ? (
              <span className="bg-navy text-white text-[12px] tracking-[0.08em] uppercase font-semibold rounded-full px-4 py-1">
                {material.categories.name}
              </span>
            ) : null}
            {material.age_range ? (
              <span className="border border-line text-ink/60 text-[13px] rounded-full px-4 py-1">
                {material.age_range}
              </span>
            ) : null}
          </div>

          <h1 className="font-display italic font-semibold text-[32px] md:text-[38px] text-ink leading-tight">
            {material.title}
          </h1>

          {material.description ? (
            <p className="text-ink/70 text-[16px] max-w-xl">{material.description}</p>
          ) : null}

          {material.pdf_path ? (
            <a
              href={`/api/pdf-material/${material.id}?mode=download`}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-[15px] bg-navy text-white hover:bg-ink transition-colors duration-150 w-fit"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M10 3v10" strokeLinecap="round" />
                <path d="M6 9.5 10 13.5 14 9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16.5h12" strokeLinecap="round" />
              </svg>
              Baixar Material
            </a>
          ) : null}
        </div>
      </div>

      {material.video_url ? (
        <section className="border border-line rounded-2xl bg-card overflow-hidden">
          <div className="p-5 border-b border-line">
            <h2 className="font-heading font-semibold text-[18px] text-ink">Como usar</h2>
          </div>
          <div className="p-5">
            <div className="aspect-video rounded-sm overflow-hidden border border-line">
              <iframe
                src={toEmbedUrl(material.video_url)}
                title="Como usar"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      ) : null}

      {material.instructions ? <GuideContent markdown={material.instructions} /> : null}
    </div>
  );
}
