import { Card } from "@/components/ui/Card";
import { VerificarCodigoForm } from "@/components/auth/VerificarCodigoForm";

export default function ConfirmarConvitePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">Confirme seu convite</h1>
        </div>
        <Card>
          <VerificarCodigoForm
            tipo="invite"
            pedirEmail
            destino="/redefinir-senha"
            descricao="Digite o e-mail que recebeu o convite e o código de 6 dígitos que mandamos pra ele."
          />
        </Card>
      </div>
    </main>
  );
}
