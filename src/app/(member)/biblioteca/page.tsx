import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToTrack } from "@/lib/entitlements";
import { Cover } from "@/components/member/Cover";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProductCode, Track, Week } from "@/lib/supabase/types";

type ShelfItem = Week & {
  virtues: { name: string; number: number } | null;
  tracks: Pick<Track, "slug" | "name">;
};

export default async function BibliotecaPage() {
  const profile = await requireFamily();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tracks }, { data: entitlements }] = await Promise.all([
    supabase.from("tracks").select("*"),
    supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
  ]);

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  const accessibleTrackIds = (tracks ?? [])
    .filter((t) => hasAccessToTrack(entitlementCodes, t))
    .map((t) => t.id);

  let items: ShelfItem[] = [];
  if (accessibleTrackIds.length > 0) {
    const { data } = await supabase
      .from("weeks")
      .select("*, virtues(name, number), tracks(slug, name)")
      .in("track_id", accessibleTrackIds)
      .lte("release_date", today)
      .returns<ShelfItem[]>();

    items = (data ?? []).sort(
      (a, b) => a.tracks.name.localeCompare(b.tracks.name) || a.week_number - b.week_number,
    );
  }

  return (
    <div>
      <SectionHeading eyebrow="Sua coleção" title="Biblioteca" />

      {items.length === 0 ? (
        <p className="text-ink/60">
          Assim que suas trilhas tiverem semanas liberadas, os livrinhos aparecem aqui.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/trilhas/${item.tracks.slug}/semanas/${item.week_number}`}
              className="flex flex-col gap-2 group"
            >
              <Cover
                trackSlug={item.tracks.slug}
                mark={String(item.virtues?.number ?? item.week_number)}
                className="aspect-[3/4] w-full group-hover:opacity-90 transition-opacity"
              />
              <div>
                <h3 className="font-heading font-semibold text-[16px] text-ink leading-tight">
                  {item.virtues?.name ?? "Virtude"}
                </h3>
                <p className="text-ink/50 text-[13px]">
                  {item.tracks.name} · Semana {item.week_number}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
