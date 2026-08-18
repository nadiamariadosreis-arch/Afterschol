import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToCatalog } from "@/lib/entitlements";
import { MaterialsGrid } from "@/components/member/MaterialsGrid";
import type { Material, ProductCode } from "@/lib/supabase/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const profile = await requireFamily();

  const supabase = await createClient();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_code")
    .eq("family_id", profile.id);
  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  if (!hasAccessToCatalog(entitlementCodes)) redirect("/dashboard");

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();
  if (!category) notFound();

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order")
    .returns<Material[]>();

  return (
    <div className="flex flex-col gap-8">
      <Link href="/dashboard" className="text-navy text-[14px] hover:underline underline-offset-4 w-fit">
        ← Voltar ao catálogo
      </Link>

      <div>
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-2">
          Categoria
        </div>
        <h1 className="font-heading font-bold text-[28px] md:text-[34px] text-navy">
          {category.name}
        </h1>
      </div>

      <MaterialsGrid materials={materials ?? []} />
    </div>
  );
}
