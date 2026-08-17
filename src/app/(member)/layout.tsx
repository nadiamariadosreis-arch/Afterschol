import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { SidebarShell } from "@/components/member/SidebarShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireFamily();
  const supabase = await createClient();
  const activeId = await getActiveChildProfileId();

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
      <SidebarShell activeChildName={activeChildName} isAdmin={profile.role === "admin"} />
      <main className="flex-1 md:pl-64 px-6 md:px-12 py-10 max-w-6xl w-full bg-cream">{children}</main>
    </>
  );
}
