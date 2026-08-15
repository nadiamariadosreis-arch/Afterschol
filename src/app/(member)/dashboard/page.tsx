import Link from "next/link";
import { requireCurrentCycle } from "@/lib/apfa/session";
import { cycleLabel, cycleProgress, pilarStatus } from "@/lib/apfa/ciclo";
import { ModuleCard } from "@/components/member/ModuleCard";
import { Card } from "@/components/ui/Card";
import { Sunburst } from "@/components/ui/Sunburst";

const PILARES = [
  {
    key: "avaliar" as const,
    href: "/ciclo/avaliar",
    numero: 1,
    titulo: "Avaliar",
    resumo: "Sentar uma vez, olhar o cenário real, sem julgamento.",
    gratis: true,
  },
  {
    key: "planejar" as const,
    href: "/ciclo/planejar",
    numero: 2,
    titulo: "Planejar",
    resumo: "Decidir o plano do mês, com ação real para o que dói.",
    gratis: false,
  },
  {
    key: "fazer_acontecer" as const,
    href: "/ciclo/fazer-acontecer",
    numero: 3,
    titulo: "Fazer Acontecer",
    resumo: "O dia em que o dinheiro cai é o dia de agir — não depois.",
    gratis: false,
  },
  {
    key: "acompanhar" as const,
    href: "/ciclo/acompanhar",
    numero: 4,
    titulo: "Acompanhar",
    resumo: "Revisão contínua, com perguntas — não cobrança.",
    gratis: false,
  },
];

export default async function DashboardPage() {
  const { profile, cycle } = await requireCurrentCycle();
  const status = pilarStatus(cycle);
  const progress = cycleProgress(cycle);
  const nome = profile.family_name || "família";
  const checkoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#";

  const proximo = PILARES.find((p) => (p.gratis || profile.paid) && !status[p.key]);
  const pedirUpgrade = !profile.paid && status.avaliar;

  return (
    <div className="flex flex-col gap-8">
      <div className="cover-gradient relative rounded-2xl overflow-hidden px-7 py-8 md:px-10 md:py-10">
        <Sunburst size={220} className="absolute -right-10 -top-16 text-white/10" />
        <div className="relative">
          <div className="text-white/60 text-[13px] tracking-[0.22em] uppercase font-semibold mb-2">
            {cycleLabel(cycle.year, cycle.month)}
          </div>
          <h1 className="font-display-italic font-semibold text-[34px] md:text-[40px] text-white">
            Olá, <span className="text-orange-light">{nome}</span>!
          </h1>
          <p className="text-white/75 text-[15px] mt-2 max-w-md">
            {progress === 100
              ? "Ciclo completo — seu planner deste mês já está pronto no Histórico."
              : "Siga os 4 módulos, na ordem, para fechar o ciclo deste mês."}
          </p>
          <div className="max-w-sm mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white/80 text-[13px] font-semibold shrink-0">{progress}%</span>
          </div>
        </div>
      </div>

      {pedirUpgrade ? (
        <div className="bg-orange rounded-2xl px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1">
            <div className="text-white/75 text-[12px] tracking-[0.2em] uppercase font-bold mb-1.5">
              Pronta pra colocar em prática?
            </div>
            <h2 className="font-display-italic font-semibold text-white text-[22px] mb-1">
              Libere Planejar, Fazer Acontecer e Acompanhar
            </h2>
            <p className="text-white/85 text-[14px]">
              Você já viu o diagnóstico real das suas finanças no Avaliar — agora é hora de
              transformar isso num plano de ação.
            </p>
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-[15px] bg-white text-orange-dark hover:bg-cream shrink-0 transition-colors"
          >
            Liberar acesso completo →
          </a>
        </div>
      ) : proximo ? (
        <div className="bg-orange rounded-2xl px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1">
            <div className="text-white/75 text-[12px] tracking-[0.2em] uppercase font-bold mb-1.5">
              Comece por aqui
            </div>
            <h2 className="font-display-italic font-semibold text-white text-[22px] mb-1">
              Pilar {proximo.numero} — {proximo.titulo}
            </h2>
            <p className="text-white/85 text-[14px]">{proximo.resumo}</p>
          </div>
          <Link
            href={proximo.href}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-[15px] bg-white text-orange-dark hover:bg-cream shrink-0 transition-colors"
          >
            Continuar →
          </Link>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-5">
        {PILARES.map((p) => (
          <ModuleCard
            key={p.key}
            href={p.href}
            numero={p.numero}
            titulo={p.titulo}
            resumo={p.resumo}
            concluido={status[p.key]}
            bloqueado={!p.gratis && !profile.paid}
          />
        ))}
      </div>

      {progress === 100 ? (
        <Card className="bg-orange-light/40 border-orange-light">
          <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-1">
            Este ciclo está fechado
          </h3>
          <p className="text-ink/70 text-[15px]">
            Veja o planner gerado no Histórico, ou volte quando o próximo mês começar — a plataforma
            abre o novo ciclo automaticamente.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
