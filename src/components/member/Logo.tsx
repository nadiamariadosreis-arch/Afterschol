import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
      <svg aria-hidden viewBox="0 0 48 48" className="w-9 h-9 shrink-0">
        <circle cx="24" cy="24" r="21" fill="#12A594" opacity="0.15" />
        <path
          d="M17 15c-4 0-7 3-7 7 0 2 1 3.6 2.6 4.7C11.6 27.7 11 29.2 11 31c0 3.9 3.1 6 7 6 2.7 0 5-1.3 6-3.3 1 2 3.3 3.3 6 3.3 3.9 0 7-2.1 7-6 0-1.8-.6-3.3-1.6-4.3C37 25.6 38 24 38 22c0-4-3-7-7-7-1.3 0-2.5.4-3.5 1-1-1.6-2.8-2.7-4.5-2.7s-3.5 1.1-4.5 2.7c-1-.6-2.2-1-3.5-1Z"
          fill="none"
          stroke="#FF6B57"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M24 15v22" stroke="#FF6B57" strokeWidth="1.2" />
        <circle cx="17" cy="22" r="1.4" fill="#FF6B57" />
        <circle cx="31" cy="22" r="1.4" fill="#FF6B57" />
        <circle cx="20" cy="30" r="1.4" fill="#FF6B57" />
        <circle cx="28" cy="30" r="1.4" fill="#FF6B57" />
      </svg>
      <div>
        <div className="font-display font-bold text-ink text-[19px] leading-none">
          Cérebro em Jogo
        </div>
        {!compact ? (
          <div className="text-[10px] tracking-[0.14em] uppercase text-teal-dark font-bold mt-1.5 hidden sm:block">
            Jogos que ensinam brincando
          </div>
        ) : null}
      </div>
    </Link>
  );
}
