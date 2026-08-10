"use client";

import { useState, type ReactNode } from "react";

export function WeekTabs({
  contentTab,
  guideTab,
  initialTab = "conteudo",
}: {
  contentTab: ReactNode;
  guideTab: ReactNode | null;
  initialTab?: "conteudo" | "guia";
}) {
  const [tab, setTab] = useState<"conteudo" | "guia">(guideTab ? initialTab : "conteudo");

  if (!guideTab) return <>{contentTab}</>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-line">
        <TabButton active={tab === "conteudo"} onClick={() => setTab("conteudo")}>
          Conteúdo
        </TabButton>
        <TabButton active={tab === "guia"} onClick={() => setTab("guia")}>
          Guia dos Pais
        </TabButton>
      </div>

      {tab === "conteudo" ? contentTab : guideTab}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-[15px] font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-moss text-ink" : "border-transparent text-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
