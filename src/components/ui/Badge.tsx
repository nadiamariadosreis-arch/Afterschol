export type BadgeTone = "teal" | "coral" | "sun" | "roxo" | "azul" | "rosa" | "laranja" | "verde" | "muted";

const TONES: Record<BadgeTone, string> = {
  teal: "border-teal text-teal-dark bg-teal/10",
  coral: "border-coral text-coral-dark bg-coral/10",
  sun: "border-sun text-ink bg-sun/20",
  roxo: "border-roxo text-roxo-dark bg-roxo/10",
  azul: "border-azul text-azul-dark bg-azul/10",
  rosa: "border-rosa text-rosa-dark bg-rosa/10",
  laranja: "border-laranja text-laranja-dark bg-laranja/10",
  verde: "border-verde text-verde-dark bg-verde/10",
  muted: "border-line text-ink/50",
};

export function Badge({
  tone = "teal",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block border ${TONES[tone]} rounded-full px-3 py-1 text-[13px] font-body font-semibold`}
    >
      {children}
    </span>
  );
}
