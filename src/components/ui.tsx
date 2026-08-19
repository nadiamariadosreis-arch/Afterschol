import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-700",
    secondary: "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100",
    ghost: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 ${props.className ?? ""}`}
    />
  );
}

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}
