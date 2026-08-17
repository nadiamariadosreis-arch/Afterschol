import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { MetaPixel } from "@/components/MetaPixel";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Método A.P.F.A",
  description:
    "Um método simples para famílias católicas colocarem o dinheiro em ordem — não por controle, mas por confiança.",
  appleWebApp: {
    title: "Método A.P.F.A",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#e0692b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
