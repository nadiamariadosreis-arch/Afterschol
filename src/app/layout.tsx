import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cérebro em Jogo",
  description:
    "Jogos pedagógicos para alfabetização e formação de virtudes — organizados por desafio, com PDF para baixar e videoaula explicando como jogar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
