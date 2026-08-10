const TRACK_PALETTES: Record<
  string,
  { from: string; to: string; wash1: string; wash2: string; ink: string }
> = {
  letras: { from: "#e9efe1", to: "#c9d9ba", wash1: "#f5f8f0", wash2: "#b4c8a2", ink: "#4a5d45" },
  silabas: { from: "#f6e9db", to: "#e8caa9", wash1: "#fbf3ea", wash2: "#dcb488", ink: "#a4644c" },
  gramatica: { from: "#e8ecf1", to: "#c9d3de", wash1: "#f4f6f9", wash2: "#b6c3d2", ink: "#333a4d" },
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(h, 31) + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Paper-grain texture, generated once and reused by every Cover instance.
const GRAIN_URI = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
)}`;

/**
 * Cover art for a track/week. Renders the real illustration when
 * `imageUrl` is set (uploaded by the admin); otherwise falls back to a
 * generated watercolor-style wash (two soft radial blobs derived
 * deterministically from `mark`, so cards in the same track still read
 * as a family without being identical), a grain texture, a small gold
 * sprig, and a big serif glyph — standing in until real artwork exists.
 */
export function Cover({
  trackSlug,
  mark,
  imageUrl,
  className = "",
}: {
  trackSlug: string;
  mark: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "72% 42%" }}
        />
      </div>
    );
  }

  const palette = TRACK_PALETTES[trackSlug] ?? TRACK_PALETTES.letras;
  const seed = hashSeed(trackSlug + mark);
  const x1 = 15 + (seed % 60);
  const y1 = 10 + ((seed >> 3) % 45);
  const x2 = 25 + ((seed >> 6) % 55);
  const y2 = 45 + ((seed >> 9) % 50);
  const sprigRotate = ((seed >> 12) % 16) - 8;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: [
          `radial-gradient(circle at ${x1}% ${y1}%, ${palette.wash1}88, transparent 55%)`,
          `radial-gradient(circle at ${x2}% ${y2}%, ${palette.wash2}55, transparent 60%)`,
          `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
        ].join(", "),
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-70"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />

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
        className="absolute left-3 top-3 w-6 h-6 pointer-events-none"
        style={{ color: palette.ink, opacity: 0.7, transform: `rotate(${sprigRotate}deg)` }}
      >
        <path
          d="M20 34 C20 26 20 18 20 6"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.8"
        />
        <ellipse cx="15" cy="12" rx="4.2" ry="2.2" fill="currentColor" transform="rotate(-35 15 12)" />
        <ellipse cx="25" cy="12" rx="4.2" ry="2.2" fill="currentColor" transform="rotate(35 25 12)" />
        <ellipse cx="14" cy="20" rx="4.6" ry="2.4" fill="currentColor" transform="rotate(-30 14 20)" />
        <ellipse cx="26" cy="20" rx="4.6" ry="2.4" fill="currentColor" transform="rotate(30 26 20)" />
        <circle cx="20" cy="5" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}
