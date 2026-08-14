export function Badge({
  tone = "orange",
  children,
}: {
  tone?: "orange" | "sage" | "muted";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    orange: "border-orange text-orange-dark bg-orange/10",
    sage: "border-sage text-sage bg-sage/10",
    muted: "border-line text-ink/50",
  };

  return (
    <span className={`inline-block border ${tones[tone]} rounded-full px-3 py-1 text-[13px] font-body font-semibold`}>
      {children}
    </span>
  );
}
