"use client";

export function DeleteJogoButton() {
  return (
    <button
      type="submit"
      className="text-coral-dark hover:underline underline-offset-4 text-[14px]"
      onClick={(e) => {
        if (!confirm("Remover este jogo definitivamente?")) e.preventDefault();
      }}
    >
      Remover jogo
    </button>
  );
}
