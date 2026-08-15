import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Método A.P.F.A",
    short_name: "A.P.F.A",
    description:
      "Avalie, planeje e acompanhe as finanças da família em um só lugar, mês a mês.",
    // Direto pro painel — se a família não estiver logada, a própria rota
    // já redireciona pro login (ver requireMember em src/lib/auth.ts).
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#e0692b",
    lang: "pt-BR",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
