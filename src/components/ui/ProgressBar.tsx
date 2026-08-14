export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className="text-[13px] text-ink/60 font-semibold">{label}</span> : null}
      <div className="h-2 w-full rounded-full bg-cream-dark overflow-hidden">
        <div
          className="h-full rounded-full bg-orange transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
