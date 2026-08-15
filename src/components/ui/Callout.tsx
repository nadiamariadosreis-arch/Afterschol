import type { ReactNode } from "react";

const TONES = {
  mint: "border-mint bg-mint-bg/70 text-ink",
  orange: "border-orange bg-orange/10 text-ink",
} as const;

export function Callout({
  tone = "mint",
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`border-l-[3px] rounded-r-xl px-5 py-4 ${TONES[tone]}`}>
      {title ? <p className="font-semibold text-[15px] mb-1">{title}</p> : null}
      <div className="text-[14px] text-ink/75 leading-relaxed">{children}</div>
    </div>
  );
}
