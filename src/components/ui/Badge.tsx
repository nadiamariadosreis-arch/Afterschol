export function Badge({
  tone = "teal",
  children,
}: {
  tone?: "teal" | "coral" | "sun" | "muted";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    teal: "border-teal text-teal-dark bg-teal/10",
    coral: "border-coral text-coral-dark bg-coral/10",
    sun: "border-sun text-ink bg-sun/20",
    muted: "border-line text-ink/50",
  };

  return (
    <span
      className={`inline-block border ${tones[tone]} rounded-full px-3 py-1 text-[13px] font-body font-semibold`}
    >
      {children}
    </span>
  );
}
