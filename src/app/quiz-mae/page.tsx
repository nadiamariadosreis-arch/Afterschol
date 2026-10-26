import type { Metadata } from "next";
import { Logo } from "@/components/member/Logo";
import { QuizClient } from "./QuizClient";

export const metadata: Metadata = {
  title: "Que tipo de mãe impaciente você é? | Quiz",
  description:
    "Descubra se você é a mãe impaciente e culpada, impaciente e calada, ou a que perde a paciência e depois chora.",
};

export default function QuizMaePage() {
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <header className="px-6 md:px-[8vw] py-6">
        <Logo compact />
      </header>
      <main className="flex-1 px-6 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-line p-6 md:p-12">
          <QuizClient />
        </div>
      </main>
    </div>
  );
}
