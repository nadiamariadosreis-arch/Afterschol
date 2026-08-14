export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-display-italic font-semibold text-[34px] text-ink">{title}</h2>
      {subtitle ? <p className="text-ink/70 text-[16px] mt-3 max-w-2xl">{subtitle}</p> : null}
      <div className="w-16 h-[4px] rounded-full bg-orange mt-4 mb-8" />
    </div>
  );
}
