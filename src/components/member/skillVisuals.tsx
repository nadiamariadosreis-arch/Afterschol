export const PASTELS = [
  { bg: "#e4ecf7", fg: "#33507a" }, // soft blue
  { bg: "#e7f1e2", fg: "#3f6b3a" }, // soft green
  { bg: "#faf0d6", fg: "#8a6a1f" }, // soft gold
  { bg: "#f7e3da", fg: "#a15230" }, // soft peach
  { bg: "#f2e0e6", fg: "#8a3d55" }, // soft rose
  { bg: "#e2e7f0", fg: "#3a4a6b" }, // soft slate
];

export function paletteFor(index: number) {
  return PASTELS[index % PASTELS.length];
}

export function SkillIcon({ name }: { name: string }) {
  const key = name.toLowerCase();

  if (key.includes("aten")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M20 20 15.3 15.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("mem")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c-3.3 0-5.5 2.3-5.5 5.2 0 1.7.8 2.8 1.7 3.8.7.8 1.1 1.4 1.1 2.5v1h5.4v-1c0-1.1.4-1.7 1.1-2.5.9-1 1.7-2.1 1.7-3.8C17.5 5.3 15.3 3 12 3Z" strokeLinejoin="round" />
        <path d="M9.3 18.5h5.4M10 21h4" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("lógic") || key.includes("logic") || key.includes("racioc")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 3.5h3a1.5 1.5 0 0 1 1.5 1.5v1.5H15a1.5 1.5 0 0 1 1.5 1.5V11H18a1.5 1.5 0 0 1 0 3h-1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3V16a1.5 1.5 0 0 0-3 0v2.5H6A1.5 1.5 0 0 1 4.5 17v-3H6a1.5 1.5 0 0 0 0-3H4.5V8A1.5 1.5 0 0 1 6 6.5h1.5V5A1.5 1.5 0 0 1 9 3.5Z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (key.includes("autocontrole") || key.includes("controle") || key.includes("impulso")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="8" y="2.5" width="8" height="15" rx="2.5" />
        <circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none" />
        <path d="M12 17.5V21" strokeLinecap="round" />
        <path d="M8 21h8" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("lingua")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 5.5h16v10H9.5L6 19v-3.5H4v-10Z" strokeLinejoin="round" />
        <path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("coopera") || key.includes("social")) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8.5" cy="8" r="2.6" />
        <circle cx="16" cy="8" r="2.6" />
        <path d="M3.5 19c.7-3 2.6-4.6 5-4.6s4.3 1.6 5 4.6" strokeLinecap="round" />
        <path d="M12.8 14.6c2.1.2 3.7 1.8 4.3 4.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5c.7 3.3 1.9 4.5 5.2 5.2-3.3.7-4.5 1.9-5.2 5.2-.7-3.3-1.9-4.5-5.2-5.2 3.3-.7 4.5-1.9 5.2-5.2Z" strokeLinejoin="round" />
      <path d="M18.5 15c.4 1.6.9 2.1 2.5 2.5-1.6.4-2.1.9-2.5 2.5-.4-1.6-.9-2.1-2.5-2.5 1.6-.4 2.1-.9 2.5-2.5Z" strokeLinejoin="round" />
    </svg>
  );
}
