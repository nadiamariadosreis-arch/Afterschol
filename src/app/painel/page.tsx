import type { Metadata } from "next";
import { Painel } from "@/components/painel/Painel";

export const metadata: Metadata = {
  title: "Horarium da Mãe · Painel segundo a Regra de São Bento",
  description:
    "Painel interativo para a mãe que trabalha fora organizar oração, trabalho, casa, filhos, casamento, tempo para si e Instagram, inspirado na Regra de São Bento.",
};

export default function PainelPage() {
  return <Painel />;
}
