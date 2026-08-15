import { Sunburst } from "@/components/ui/Sunburst";
import { Card } from "@/components/ui/Card";

export function Paywall({ titulo, resumo }: { titulo: string; resumo: string }) {
  const checkoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#";

  return (
    <div className="flex flex-col gap-6">
      <div className="cover-gradient relative rounded-2xl overflow-hidden px-7 py-9 md:px-10 md:py-11">
        <Sunburst size={180} className="absolute -right-8 -top-10 text-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-white/75 text-[12px] tracking-[0.2em] uppercase font-bold mb-2">
            🔒 Conteúdo bloqueado
          </span>
          <h1 className="font-display-italic font-semibold text-white text-[30px] md:text-[34px] max-w-lg">
            {titulo}
          </h1>
          <p className="text-white/80 text-[15px] mt-2 max-w-md">{resumo}</p>
        </div>
      </div>

      <Card>
        <h2 className="font-display-italic font-semibold text-[20px] text-ink mb-2">
          Você já fez o primeiro passo de graça
        </h2>
        <p className="text-ink/70 text-[15px] mb-5">
          O Avaliar mostrou o diagnóstico real das suas finanças. Para transformar isso num plano de
          ação — organizar as dívidas, decidir o mês, executar no dia certo e acompanhar os
          resultados — é só liberar o acesso completo ao Método A.P.F.A.
        </p>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-body font-semibold text-[15px] bg-orange text-white hover:bg-orange-dark transition-colors"
        >
          Liberar acesso completo →
        </a>
      </Card>
    </div>
  );
}
