export function SectionHeading({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-teal-dark font-bold mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-display font-bold text-[34px] text-ink">{title}</h2>
      <div className="w-16 h-[4px] rounded-full bg-sun mt-4 mb-8" />
    </div>
  );
}
