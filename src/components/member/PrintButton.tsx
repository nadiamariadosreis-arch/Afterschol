"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button type="button" variant="secondary" onClick={() => window.print()} className="no-print">
      Imprimir / salvar em PDF
    </Button>
  );
}
