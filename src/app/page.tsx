import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sunburst } from "@/components/ui/Sunburst";

const PROCESSOS = [
  { titulo: "Essencial", pct: "60%", resumo: "Manter a vida funcionando." },
  { titulo: "Compromissos", pct: "10%", resumo: "Resolver o que já foi assumido." },
  { titulo: "Futuro", pct: "15%", resumo: "Construir o amanhã." },
  { titulo: "Presente", pct: "15%", resumo: "Viver bem o hoje." },
];

const PILARES = [
  { n: "01", titulo: "Avaliar", resumo: "Sentar uma vez, olhar o cenário real, sem julgamento." },
  { n: "02", titulo: "Planejar", resumo: "Decidir o plano do mês, com um plano de ação real para o que dói." },
  { n: "03", titulo: "Fazer Acontecer", resumo: "O dia em que o dinheiro cai é o dia de agir — não depois." },
  { n: "04", titulo: "Acompanhar", resumo: "Revisão contínua, com perguntas — não cobrança." },
];

export default function LandingPage() {
  return (
    <>
      <header className="px-6 md:px-[8vw] pt-16 pb-10 border-b border-line">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-8 h-8 rounded-lg bg-orange text-white flex items-center justify-center shrink-0">
            <Sunburst size={16} />
          </span>
          <span className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold">
            Finanças para famílias católicas
          </span>
        </div>
        <h1 className="font-display-italic font-semibold text-[38px] md:text-[54px] text-ink max-w-3xl leading-[1.15]">
          Um método simples para colocar o dinheiro em ordem — não por controle, mas por confiança.
        </h1>
        <p className="text-[19px] text-ink/70 max-w-2xl mt-6">
          A maioria das famílias não trava por falta de planilha — trava na hora de decidir. O
          Método A.P.F.A tira o dinheiro da cabeça, divide-o com clareza entre o que sustenta a
          casa, o que já foi assumido, o que constrói o futuro e o que é para viver bem hoje. Ordem
          financeira não é o oposto da fé — é o que abre espaço para ela: uma família que sabe onde
          está pode confiar de verdade na Providência, em vez de viver com medo.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/login" variant="primary">
            Já sou membro — entrar
          </LinkButton>
          <LinkButton href="/cadastro" variant="secondary">
            Começar meu ciclo
          </LinkButton>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-[8vw] py-16 max-w-6xl mx-auto w-full">
        <section className="mb-20">
          <SectionHeading
            eyebrow="Os 4 processos"
            title="Um lugar para cada parte do dinheiro"
            subtitle="Categorias simples, de uso diário — sem jargão financeiro. A plataforma sugere o cenário ideal a partir da sua renda, e sua família ajusta."
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {PROCESSOS.map((p) => (
              <div key={p.titulo} className="rounded-2xl bg-card border border-line p-6 flex flex-col gap-1">
                <span className="font-display-italic font-semibold text-[30px] text-orange-dark leading-none mb-2">
                  {p.pct}
                </span>
                <h3 className="font-semibold text-[17px] text-ink">{p.titulo}</h3>
                <p className="text-ink/60 text-[14px]">{p.resumo}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Os 4 pilares"
            title="O ritmo mensal que fecha o ciclo sozinho"
            subtitle="Avaliar, Planejar, Fazer Acontecer e Acompanhar — quatro módulos guiados, como um curso, nunca como um formulário financeiro frio."
          />
          <div className="grid md:grid-cols-2 gap-5">
            {PILARES.map((p) => (
              <div
                key={p.n}
                className="rounded-2xl bg-card border border-line border-l-[3px] border-l-orange p-6 flex gap-4"
              >
                <span className="font-display-italic font-semibold text-[36px] text-orange-light leading-none shrink-0">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-semibold text-[19px] text-ink mb-1">{p.titulo}</h3>
                  <p className="text-ink/65 text-[15px]">{p.resumo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
