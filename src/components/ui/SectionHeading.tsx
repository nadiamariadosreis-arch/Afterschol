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
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-display italic font-semibold text-[34px] text-ink">
        {title}
      </h2>
      <div className="w-16 h-[2px] bg-gold mt-4 mb-8" />
    </div>
  );
}

export function OrnamentDivider() {
  return <div className="ornament-divider">❦</div>;
}
