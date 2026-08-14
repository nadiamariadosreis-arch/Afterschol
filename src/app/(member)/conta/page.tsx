import { requireMember } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const profile = await requireMember();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <SectionHeading eyebrow="Minha Conta" title={profile.family_name ?? profile.email} />

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">E-mail</h3>
        <p className="text-ink/70">{profile.email}</p>
      </Card>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Alterar senha</h3>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
