import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <AdminHeader />
      <main className="flex-1 px-6 md:px-[8vw] py-12 max-w-5xl mx-auto w-full">{children}</main>
    </>
  );
}
