interface Bar {
  label: string;
  value: number;
  color: string;
}

const CHART_HEIGHT = 120;
const BAR_WIDTH = 24;
const GAP = 40;

export function StatusBarChart({ bars, title }: { bars: Bar[]; title: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const width = bars.length * (BAR_WIDTH + GAP);

  return (
    <div>
      <p className="text-sm font-medium text-ink">{title}</p>
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT + 24}`}
        className="mt-2 h-40 w-full max-w-xs"
        role="img"
        aria-label={title}
      >
        {bars.map((bar, i) => {
          const barHeight = (bar.value / max) * CHART_HEIGHT;
          const x = i * (BAR_WIDTH + GAP) + GAP / 2;
          const y = CHART_HEIGHT - barHeight;
          return (
            <g key={bar.label}>
              <title>{`${bar.label}: ${bar.value}`}</title>
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={bar.color}
              />
              <text
                x={x + BAR_WIDTH / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-ink text-[11px] font-medium"
              >
                {bar.value}
              </text>
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 16}
                textAnchor="middle"
                className="fill-ink-soft text-[10px]"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
