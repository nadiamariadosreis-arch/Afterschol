import type { Metadata } from "next";
import { Logo } from "@/components/member/Logo";
import { DesafioClient } from "./DesafioClient";

export const metadata: Metadata = {
  title: "Desafio de 7 dias: mais paciência com os filhos",
  description:
    "Uma missão por dia, durante 7 dias, para educar com mais calma, gentileza e presença.",
};

export default function DesafioPacienciaPage() {
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <header className="px-6 md:px-[8vw] py-6">
        <Logo compact />
      </header>
      <main className="flex-1 px-6 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-line p-6 md:p-12">
          <DesafioClient />
        </div>
      </main>
    </div>
  );
}
