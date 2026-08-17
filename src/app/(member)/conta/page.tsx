import { requireMember, temAcessoPago } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { EditFamilyName } from "./EditFamilyName";

export default async function AccountPage() {
  const profile = await requireMember();
  const acessoPago = temAcessoPago(profile);
  const checkoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <SectionHeading eyebrow="Minha Conta" title={profile.family_name ?? profile.email} />

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Nome da família</h3>
        <EditFamilyName familyId={profile.id} nomeInicial={profile.family_name ?? ""} />
      </Card>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">E-mail</h3>
        <p className="text-ink/70">{profile.email}</p>
      </Card>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">Acesso</h3>
        {acessoPago ? (
          <p className="text-ink/70">
            Acesso completo ativo
            {profile.paid_until
              ? ` até ${new Date(profile.paid_until).toLocaleDateString("pt-BR")}`
              : ""}
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-ink/70">
              {profile.paid
                ? "Seu acesso completo venceu — o Avaliar continua liberado, mas Planejar, Fazer Acontecer e Acompanhar precisam de uma nova compra."
                : "Você tem acesso ao Avaliar. Planejar, Fazer Acontecer e Acompanhar são liberados numa compra única."}
            </p>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-body font-semibold text-[14px] bg-orange text-white hover:bg-orange-dark transition-colors"
            >
              {profile.paid ? "Renovar acesso →" : "Liberar acesso completo →"}
            </a>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-4">Alterar senha</h3>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
