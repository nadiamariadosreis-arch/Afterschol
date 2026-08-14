import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <>
      <header className="px-6 md:px-[8vw] pt-16 pb-10 border-b border-line">
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-4">
          Finanças para famílias católicas
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
          <div className="grid md:grid-cols-4 gap-5">
            <Card>
              <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Essencial · 60%</h3>
              <p className="text-ink/65 text-[15px]">Manter a vida funcionando.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Compromissos · 10%</h3>
              <p className="text-ink/65 text-[15px]">Resolver o que já foi assumido.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Futuro · 15%</h3>
              <p className="text-ink/65 text-[15px]">Construir o amanhã.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[19px] text-ink mb-1">Presente · 15%</h3>
              <p className="text-ink/65 text-[15px]">Viver bem o hoje.</p>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Os 4 pilares"
            title="O ritmo mensal que fecha o ciclo sozinho"
            subtitle="Avaliar, Planejar, Fazer Acontecer e Acompanhar — quatro módulos guiados, como um curso, nunca como um formulário financeiro frio."
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-2">1. Avaliar</h3>
              <p className="text-ink/70">Sentar uma vez, olhar o cenário real, sem julgamento.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-2">2. Planejar</h3>
              <p className="text-ink/70">Decidir o plano do mês, com um plano de ação real para o que dói.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-2">3. Fazer Acontecer</h3>
              <p className="text-ink/70">O dia em que o dinheiro cai é o dia de agir — não depois.</p>
            </Card>
            <Card>
              <h3 className="font-display-italic font-semibold text-[20px] text-ink mb-2">4. Acompanhar</h3>
              <p className="text-ink/70">Revisão contínua, com perguntas — não cobrança.</p>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
