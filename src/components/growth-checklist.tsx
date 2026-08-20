"use client";

import { StaggerItem, StaggerList } from "@/components/motion";

const ITEMS = [
  "Poste com uma frequência que você consegue sustentar (melhor 3x/semana sempre do que 7x por 2 semanas e sumir).",
  "Use os primeiros 3 segundos do reels para o gancho — sem enrolação antes de entregar valor.",
  "Responda todos os comentários nas primeiras horas: isso sinaliza ao algoritmo que o post gera conversa.",
  "Use stories todos os dias, mesmo sem postar no feed — enquetes e caixinhas de pergunta geram proximidade.",
  "Misture hashtags de nicho (mais específicas) com hashtags maiores — evite só as genéricas de milhões de posts.",
  "Comente em perfis maiores do seu nicho para ganhar visibilidade orgânica — não só espere ser encontrado.",
  "Revise o grid a cada 9 posts: a primeira impressão de quem chega no perfil é esse conjunto.",
];

export function GrowthChecklist() {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-ink">
        6. Checklist de crescimento orgânico
      </h2>
      <StaggerList className="mt-3 space-y-2">
        {ITEMS.map((item) => (
          <StaggerItem key={item} className="flex items-start gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-orange" />
            <span>{item}</span>
          </StaggerItem>
        ))}
      </StaggerList>
    </div>
  );
}
