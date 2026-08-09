import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { MemberHeader } from "@/components/member/MemberHeader";

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
      <MemberHeader activeChildName={activeChildName} isAdmin={profile.role === "admin"} />
      <main className="flex-1 px-6 md:px-[8vw] py-12 max-w-6xl mx-auto w-full">{children}</main>
    </>
  );
}
