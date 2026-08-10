import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="w-9 h-9 shrink-0"
        style={{ color: "#4a5d45" }}
      >
        <path
          d="M6 12c6-3 12-2 18 1v25c-6-3-12-4-18-1V12Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M42 12c-6-3-12-2-18 1v25c6-3 12-4 18-1V12Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M24 13v25" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M24 3 25.4 6.8 29 8 25.4 9.2 24 13 22.6 9.2 19 8 22.6 6.8 24 3Z"
          fill="#b08d45"
        />
      </svg>
      <div>
        <div className="font-display italic font-semibold text-ink text-[19px] leading-none">
          Trilha das Virtudes
        </div>
        {!compact ? (
          <div className="text-[10px] tracking-[0.14em] uppercase text-moss mt-1.5 hidden sm:block">
            Histórias que formam o coração e fazem o conhecimento florescer
          </div>
        ) : null}
      </div>
    </Link>
  );
}
