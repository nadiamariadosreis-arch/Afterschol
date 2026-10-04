import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountTabs } from "@/components/admin/instagram/AccountTabs";

export default async function InstagramAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("ig_accounts")
    .select("id, handle, name, voice")
    .order("sort_order")
    .order("created_at");

  const account = (accounts ?? []).find((item) => item.id === accountId);
  if (!account) notFound();

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <Link
            href="/admin/instagram"
            className="font-body text-[13px] tracking-[0.28em] uppercase text-moss hover:underline"
          >
            Painel do Instagram
          </Link>
          <h2 className="font-display italic font-semibold text-[34px] text-ink leading-tight">
            {account.name}
          </h2>
          <p className="text-ink/60 text-[14px]">
            @{account.handle}
            {account.voice ? ` · ${account.voice}` : ""}
          </p>
        </div>

        {(accounts ?? []).length > 1 ? (
          <div className="flex gap-2 flex-wrap" aria-label="Alternar perfil">
            {(accounts ?? []).map((item) => (
              <Link
                key={item.id}
                href={`/admin/instagram/${item.id}/matriz`}
                className={`rounded-full px-4 py-1.5 text-[14px] border ${
                  item.id === accountId
                    ? "bg-moss border-moss text-parchment"
                    : "border-line text-ink/70 hover:border-moss"
                }`}
              >
                @{item.handle}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <AccountTabs accountId={accountId} />
      {children}
    </div>
  );
}
