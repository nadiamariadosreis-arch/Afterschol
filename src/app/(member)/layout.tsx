import { requireMember } from "@/lib/auth";
import { SidebarShell } from "@/components/member/SidebarShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireMember();

  return (
    <>
      <SidebarShell />
      <main className="flex-1 md:pl-64 px-6 md:px-12 py-10 max-w-5xl w-full">{children}</main>
    </>
  );
}
