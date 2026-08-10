import { requireMember } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const profile = await requireMember();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <SectionHeading eyebrow="Minha Conta" title={profile.full_name ?? profile.email} />

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Meu acesso</h3>
        <Badge tone="teal">Biblioteca completa de jogos</Badge>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Alterar senha</h3>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
