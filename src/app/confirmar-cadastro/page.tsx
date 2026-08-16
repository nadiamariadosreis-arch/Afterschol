import { Card } from "@/components/ui/Card";
import { VerificarCodigoForm } from "@/components/auth/VerificarCodigoForm";

export default function ConfirmarCadastroPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display-italic font-semibold text-[32px] text-ink">Confirme seu e-mail</h1>
        </div>
        <Card>
          <VerificarCodigoForm
            tipo="signup"
            pedirEmail
            destino="/dashboard"
            descricao="Digite o e-mail que você cadastrou e o código de 6 dígitos que mandamos pra ele."
          />
        </Card>
      </div>
    </main>
  );
}
