export function Badge({
  tone = "moss",
  children,
}: {
  tone?: "moss" | "gold" | "terracotta" | "muted";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    moss: "border-moss text-moss-dark",
    gold: "border-gold text-gold",
    terracotta: "border-terracotta text-terracotta",
    muted: "border-line text-ink/50",
  };

  return (
    <span
      className={`inline-block border ${tones[tone]} rounded-full px-3 py-1 text-[13px] font-body`}
    >
      {children}
    </span>
  );
}
