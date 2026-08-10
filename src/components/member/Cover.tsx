const TRACK_PALETTES: Record<string, { from: string; to: string; ink: string }> = {
  letras: { from: "#6b8262", to: "#384936", ink: "#f4ede0" },
  silabas: { from: "#bd8267", to: "#7c4632", ink: "#f4ede0" },
  gramatica: { from: "#525f7d", to: "#2a3040", ink: "#f4ede0" },
};

/**
 * Generated cover art (gradient + ornament + a big serif glyph) standing
 * in for real illustration — there's no artwork asset pipeline yet, so
 * every track/virtue gets a deterministic, on-brand "cover" instead of a
 * blank card.
 */
export function Cover({
  trackSlug,
  mark,
  className = "",
}: {
  trackSlug: string;
  mark: string;
  className?: string;
}) {
  const palette = TRACK_PALETTES[trackSlug] ?? TRACK_PALETTES.letras;

  return (
    <div
      className={`relative overflow-hidden rounded-sm ${className}`}
      style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
    >
      <span
        aria-hidden
        className="absolute -right-2 -bottom-6 font-display italic font-bold select-none pointer-events-none"
        style={{ fontSize: "6rem", color: palette.ink, opacity: 0.16, lineHeight: 1 }}
      >
        {mark}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 40 40"
        className="absolute left-3 top-3 w-5 h-5 pointer-events-none"
        style={{ color: palette.ink, opacity: 0.6 }}
      >
        <path
          d="M20 4 C24 12 32 14 36 20 C32 26 24 28 20 36 C16 28 8 26 4 20 C8 14 16 12 20 4 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
