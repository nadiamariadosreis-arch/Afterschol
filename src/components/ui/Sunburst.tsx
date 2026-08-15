export function Sunburst({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.5 4.5l4.2 4.2M15.3 15.3l4.2 4.2M19.5 4.5l-4.2 4.2M8.7 15.3l-4.2 4.2" />
    </svg>
  );
}
