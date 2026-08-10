import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToTrack } from "@/lib/entitlements";
import { SidebarShell } from "@/components/member/SidebarShell";
import type { ProductCode } from "@/lib/supabase/types";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireFamily();
  const supabase = await createClient();
  const activeId = await getActiveChildProfileId();

  const [{ data: tracks }, { data: entitlements }] = await Promise.all([
    supabase.from("tracks").select("*").order("sort_order"),
    supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
  ]);

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  const sidebarTracks = (tracks ?? []).map((track) => ({
    slug: track.slug,
    name: track.name,
    accessible: hasAccessToTrack(entitlementCodes, track),
  }));

  let activeChildName: string | null = null;
  if (activeId) {
    const { data } = await supabase
      .from("child_profiles")
      .select("name")
      .eq("id", activeId)
      .maybeSingle();
    activeChildName = data?.name ?? null;
  }

  return (
    <>
      <SidebarShell
        tracks={sidebarTracks}
        activeChildName={activeChildName}
        isAdmin={profile.role === "admin"}
      />
      <main className="flex-1 md:pl-64 px-6 md:px-12 py-10 max-w-6xl w-full">{children}</main>
    </>
  );
}
