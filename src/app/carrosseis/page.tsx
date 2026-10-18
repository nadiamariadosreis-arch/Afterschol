import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Do Zero aos 10 Mil Seguidores com Carrosséis",
  description:
    "O método que levou um perfil a mais de 50 mil seguidores usando carrosséis no Instagram, em e-book e com um sistema que cria os carrosséis para você.",
};

// Edite aqui antes de publicar: preços e links de checkout (Kiwify).
// O plano completo deve ser configurado na Kiwify como oferta principal
// (e-book) + order bump (sistema de carrosséis), ou como uma segunda oferta.
const PLANS = {
  ebook: {
    price: process.env.NEXT_PUBLIC_PRECO_EBOOK ?? "R$ --,--",
    checkout: process.env.NEXT_PUBLIC_CHECKOUT_EBOOK ?? "#planos",
  },
  completo: {
    price: process.env.NEXT_PUBLIC_PRECO_COMPLETO ?? "R$ --,--",
    checkout: process.env.NEXT_PUBLIC_CHECKOUT_COMPLETO ?? "#planos",
  },
};

export default function SalesPage() {
  return (
    <div className="bg-cream min-h-screen">
      <main>
        <Hero />
        <Pain />
        <Method />
        <About />
        <Plans />
        <System />
        <Faq />
        <FinalCta />
      </main>
      <footer className="px-6 py-8 text-center text-[13px] text-ink/50 border-t border-line">
        <p>
          Os resultados dependem da aplicação do método, da constância e do
          nicho de cada perfil. Não há promessa de ganho ou de número de
          seguidores.
        </p>
        <p className="mt-2">
          Instagram é marca registrada da Meta. Este produto não é afiliado
          nem endossado pelo Instagram, pela Meta ou pela Anthropic.
        </p>
      </footer>
    </div>
  );
}

function Container({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="px-6 md:px-[8vw] py-12 md:py-16">
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
      {children}
    </div>
  );
}

function Cta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full px-8 py-4 font-body font-semibold text-[16px] bg-flame text-white hover:bg-flame-dark transition-colors"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <Container>
      <div className="rounded-2xl bg-card border border-line p-8 md:p-14">
        <Eyebrow>E-book + sistema de carrosséis</Eyebrow>
        <h1 className="font-heading font-bold text-[34px] md:text-[52px] text-navy leading-[1.1]">
          Do zero aos 10 mil seguidores com carrosséis
        </h1>
        <p className="text-ink/70 mt-5 text-[18px] max-w-2xl">
          O passo a passo que eu usei para passar de 50 mil seguidores no
          Instagram: carrosséis simples, estratégia clara e uma rotina que cabe
          na vida de quem cuida da casa e da família.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Cta href="#planos">Quero começar agora</Cta>
          <span className="text-[14px] text-ink/50">
            Acesso imediato após a confirmação do pagamento
          </span>
        </div>
      </div>
    </Container>
  );
}

function Pain() {
  const items = [
    "Você posta, posta e o perfil continua parado nos mesmos seguidores.",
    "Passa horas no Canva e ainda assim o carrossel não engaja.",
    "Não sabe o que postar, e vive sem ideia de conteúdo.",
    "Tem pouco tempo: filhos, casa, trabalho, e o Instagram fica por último.",
  ];
  return (
    <Container>
      <Eyebrow>Isso soa familiar?</Eyebrow>
      <h2 className="font-heading font-bold text-[28px] md:text-[36px] text-navy leading-tight max-w-2xl">
        Crescer no Instagram não precisa ser complicado nem tomar o seu dia.
      </h2>
      <ul className="mt-8 grid md:grid-cols-2 gap-4">
        {items.map((t) => (
          <li
            key={t}
            className="rounded-xl bg-card border border-line p-5 text-ink/80"
          >
            {t}
          </li>
        ))}
      </ul>
    </Container>
  );
}

function Method() {
  const steps = [
    {
      n: "1",
      t: "Ganchos que fazem parar o dedo",
      d: "Como escrever a capa do carrossel para a pessoa querer deslizar.",
    },
    {
      n: "2",
      t: "Estrutura que prende até o último slide",
      d: "Um roteiro simples: gancho, desenvolvimento e chamada para ação.",
    },
    {
      n: "3",
      t: "Conteúdo que gera seguidor, não só curtida",
      d: "O que postar para atrair o público certo para o seu perfil.",
    },
    {
      n: "4",
      t: "Constância sem desgaste",
      d: "Uma rotina leve de produção para manter o perfil crescendo.",
    },
  ];
  return (
    <Container>
      <Eyebrow>O método</Eyebrow>
      <h2 className="font-heading font-bold text-[28px] md:text-[36px] text-navy leading-tight">
        O que você vai aprender no e-book
      </h2>
      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-xl bg-card border border-line p-6 flex gap-4"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-heading font-bold">
              {s.n}
            </div>
            <div>
              <h3 className="font-heading font-bold text-navy text-[18px]">
                {s.t}
              </h3>
              <p className="text-ink/70 mt-1">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

function About() {
  return (
    <Container>
      <div className="rounded-2xl bg-navy text-white p-8 md:p-12">
        <Eyebrow>Quem está por trás</Eyebrow>
        <h2 className="font-heading font-bold text-[28px] md:text-[34px] leading-tight">
          Eu também comecei do zero, e sou mãe de três filhos.
        </h2>
        <p className="text-white/80 mt-4 max-w-2xl text-[17px]">
          Cresci meu perfil até mais de 50 mil seguidores usando carrosséis,
          entre a rotina da casa e o cuidado com as crianças. Não tenho equipe
          nem estúdio: tenho um método simples, que eu ensino aqui exatamente
          como aplico.
        </p>
      </div>
    </Container>
  );
}

function Check({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <li className={`flex gap-3 ${muted ? "text-ink/45" : "text-ink/80"}`}>
      <span aria-hidden className={muted ? "text-ink/30" : "text-flame"}>
        {muted ? "✕" : "✓"}
      </span>
      <span>{children}</span>
    </li>
  );
}

function Plans() {
  return (
    <Container id="planos">
      <Eyebrow>Escolha o seu plano</Eyebrow>
      <h2 className="font-heading font-bold text-[28px] md:text-[36px] text-navy leading-tight">
        Dois jeitos de começar
      </h2>
      <div className="mt-8 grid md:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-2xl bg-card border border-line p-8 flex flex-col">
          <h3 className="font-heading font-bold text-[22px] text-navy">
            Plano E-book
          </h3>
          <p className="text-ink/60 mt-1">Para quem quer aprender o método.</p>
          <div className="font-heading font-bold text-[36px] text-navy mt-5">
            {PLANS.ebook.price}
          </div>
          <ul className="mt-5 space-y-3 flex-1">
            <Check>E-book digital “Do zero aos 10 mil seguidores com carrosséis”</Check>
            <Check>Método completo, passo a passo</Check>
            <Check muted>Sistema que cria os carrosséis para você</Check>
          </ul>
          <div className="mt-8">
            <a
              href={PLANS.ebook.checkout}
              className="inline-flex w-full items-center justify-center rounded-full px-8 py-4 font-body font-semibold text-[16px] border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Quero só o e-book
            </a>
          </div>
        </div>

        <div className="relative rounded-2xl bg-card border-2 border-flame p-8 flex flex-col shadow-lg">
          <span className="absolute -top-3 left-8 rounded-full bg-flame text-white text-[12px] font-semibold tracking-wider uppercase px-3 py-1">
            Mais completo
          </span>
          <h3 className="font-heading font-bold text-[22px] text-navy">
            Plano E-book + Sistema de Carrosséis
          </h3>
          <p className="text-ink/60 mt-1">
            Aprenda o método e tenha os carrosséis prontos na hora.
          </p>
          <div className="font-heading font-bold text-[36px] text-flame mt-5">
            {PLANS.completo.price}
          </div>
          <ul className="mt-5 space-y-3 flex-1">
            <Check>Tudo do Plano E-book</Check>
            <Check>
              Sistema de IA integrado que cria os carrosséis para você
            </Check>
            <Check>Carrosséis prontos para postar, sem começar do zero</Check>
          </ul>
          <p className="mt-5 rounded-lg bg-cream border border-line p-3 text-[14px] text-ink/70">
            <strong>Importante:</strong> para o sistema funcionar, você precisa
            ter o Claude na versão paga.
          </p>
          <div className="mt-6">
            <Cta href={PLANS.completo.checkout}>Quero o plano completo</Cta>
          </div>
        </div>
      </div>
    </Container>
  );
}

function System() {
  const steps = [
    { t: "Você conta o tema", d: "Escreve sobre o que quer falar no carrossel." },
    { t: "O sistema cria o roteiro", d: "Gancho, slides e chamada para ação, no formato que funciona." },
    { t: "Você recebe o carrossel pronto", d: "É só revisar, ajustar ao seu jeito e postar." },
  ];
  return (
    <Container>
      <Eyebrow>Sobre o sistema</Eyebrow>
      <h2 className="font-heading font-bold text-[28px] md:text-[36px] text-navy leading-tight max-w-2xl">
        Como o sistema de carrosséis funciona
      </h2>
      <ol className="mt-8 grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <li key={s.t} className="rounded-xl bg-card border border-line p-6">
            <div className="text-flame font-heading font-bold text-[14px] tracking-widest">
              PASSO {i + 1}
            </div>
            <h3 className="font-heading font-bold text-navy text-[18px] mt-1">
              {s.t}
            </h3>
            <p className="text-ink/70 mt-1">{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-xl border-2 border-dashed border-flame/60 bg-card p-6">
        <h3 className="font-heading font-bold text-navy text-[18px]">
          Antes de comprar o plano completo
        </h3>
        <p className="text-ink/75 mt-1">
          O sistema roda dentro do Claude e só funciona com uma assinatura paga
          do Claude (Pro ou superior), contratada por você diretamente com a
          Anthropic. O valor da assinatura não está incluso no plano. Se você
          ainda não pretende assinar, o Plano E-book é a melhor escolha: o
          método é o mesmo.
        </p>
      </div>
    </Container>
  );
}

function Faq() {
  const items = [
    {
      q: "Preciso ter experiência com design?",
      a: "Não. O método e o sistema foram pensados para quem está começando e tem pouco tempo.",
    },
    {
      q: "Preciso pagar o Claude para usar o e-book?",
      a: "Não. A assinatura paga do Claude só é necessária para o sistema que cria os carrosséis (Plano Completo).",
    },
    {
      q: "Posso começar só com o e-book e adicionar o sistema depois?",
      a: "Sim. Fale com o suporte depois da compra e veja as condições para adicionar o sistema.",
    },
    {
      q: "Serve para qualquer nicho?",
      a: "O método vale para perfis de nichos diferentes. Os exemplos partem da minha experiência, mas você aplica ao seu tema.",
    },
    {
      q: "Como recebo o produto?",
      a: "Por e-mail, logo após a confirmação do pagamento.",
    },
  ];
  return (
    <Container>
      <Eyebrow>Dúvidas frequentes</Eyebrow>
      <div className="mt-4 space-y-3">
        {items.map((i) => (
          <details
            key={i.q}
            className="rounded-xl bg-card border border-line p-5 group"
          >
            <summary className="cursor-pointer font-heading font-semibold text-navy">
              {i.q}
            </summary>
            <p className="text-ink/70 mt-2">{i.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}

function FinalCta() {
  return (
    <Container>
      <div className="rounded-2xl bg-card border border-line p-8 md:p-14 text-center">
        <h2 className="font-heading font-bold text-[28px] md:text-[38px] text-navy leading-tight">
          Seu primeiro carrossel pode estar pronto hoje.
        </h2>
        <p className="text-ink/70 mt-3 max-w-xl mx-auto">
          Escolha o plano e comece a crescer o seu perfil com carrosséis.
        </p>
        <div className="mt-8">
          <Cta href="#planos">Escolher meu plano</Cta>
        </div>
      </div>
    </Container>
  );
}
