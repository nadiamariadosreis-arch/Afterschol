import { requireMember } from "@/lib/auth";
import { SidebarShell } from "@/components/member/SidebarShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireMember();

  return (
    <>
      <SidebarShell isAdmin={profile.role === "admin"} />
      <main className="flex-1 md:pl-64 px-6 md:px-12 py-10 max-w-6xl w-full">{children}</main>
    </>
  );
}
