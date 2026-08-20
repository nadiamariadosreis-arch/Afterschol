import { readableTextColor } from "@/lib/color";

export function IdentityPreview({
  username,
  bio,
  colors,
}: {
  username: string;
  bio: string;
  colors: string[];
}) {
  const bg = colors[0] || "#f5efe1";
  const accent = colors[1] || "#e0692b";
  const textColor = readableTextColor(bg);

  return (
    <div className="sticky top-6">
      <p className="mb-2 text-sm font-medium text-ink">Como fica na prática</p>
      <div
        className="aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-line shadow-sm"
        style={{ backgroundColor: bg }}
      >
        <div className="flex h-full flex-col justify-between p-5">
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: accent, color: readableTextColor(accent) }}
          >
            {username || "@seu_perfil"}
          </span>
          <p
            className="text-sm leading-snug font-medium"
            style={{ color: textColor }}
          >
            {bio || "Sua bio aparece aqui — é assim que a cor de fundo conversa com o texto."}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {colors.map(
          (color, i) =>
            color && (
              <span
                key={i}
                className="h-6 w-6 rounded-full border border-line"
                style={{ backgroundColor: color }}
                title={color}
              />
            ),
        )}
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Prévia ilustrativa — o objetivo é você ver a paleta aplicada antes de decidir.
      </p>
    </div>
  );
}
