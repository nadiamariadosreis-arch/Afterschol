import { redirect } from "next/navigation";

export default async function InstagramAccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  redirect(`/admin/instagram/${accountId}/matriz`);
}
