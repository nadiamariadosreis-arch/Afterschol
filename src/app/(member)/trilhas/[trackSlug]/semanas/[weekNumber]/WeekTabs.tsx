"use client";

import { useState, type ReactNode } from "react";

export type WeekTab = {
  key: string;
  label: string;
  content: ReactNode;
};

export function WeekTabs({ tabs, initialTab }: { tabs: WeekTab[]; initialTab?: string }) {
  const initial = tabs.find((t) => t.key === initialTab)?.key ?? tabs[0]?.key;
  const [tab, setTab] = useState<string | undefined>(initial);

  if (tabs.length <= 1) return <>{tabs[0]?.content ?? null}</>;

  const active = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-line overflow-x-auto">
        {tabs.map((t) => (
          <TabButton key={t.key} active={t.key === active.key} onClick={() => setTab(t.key)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      {active.content}
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
      className={`px-4 py-2.5 text-[15px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
        active ? "border-moss text-ink" : "border-transparent text-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
