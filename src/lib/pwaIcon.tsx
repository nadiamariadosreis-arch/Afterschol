const RAYS =
  "M12 2v6M12 16v6M2 12h6M16 12h6M4.5 4.5l4.2 4.2M15.3 15.3l4.2 4.2M19.5 4.5l-4.2 4.2M8.7 15.3l-4.2 4.2";

/**
 * Same mark as <Sunburst>/<Logo> (orange badge + white sunburst), rendered
 * for next/og's ImageResponse — used to generate every PWA/app icon size
 * from one source instead of checking in a set of binary assets.
 */
export function pwaIcon({ size, maskable = false }: { size: number; maskable?: boolean }) {
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const rayBox = Math.round(maskable ? size * 0.42 : size * 0.5);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#e0692b",
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={rayBox} height={rayBox} viewBox="0 0 24 24">
        <path d={RAYS} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}
