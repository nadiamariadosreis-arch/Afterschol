"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPdfUploadUrlAction } from "@/lib/pdf-upload-actions";

type Status = "idle" | "uploading" | "done" | "error";

/**
 * Uploads a PDF straight to Supabase Storage via a signed URL (browser
 * -> Storage directly), then exposes the resulting path through a hidden
 * form field so the enclosing <form>'s server action just persists the
 * path — no file bytes ever go through the server action itself.
 */
export function PdfUploadField({
  name,
  path,
  hasExisting,
}: {
  name: string;
  path: string;
  hasExisting?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const result = await createPdfUploadUrlAction(path);
    if ("error" in result) {
      setStatus("error");
      setError(result.error);
      return;
    }

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("content")
      .uploadToSignedUrl(result.path, result.token, file, { contentType: "application/pdf" });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    setSavedPath(result.path);
    setStatus("done");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input type="file" accept="application/pdf" onChange={handleChange} className="text-[13px]" />
      <input type="hidden" name={name} value={savedPath ?? ""} />
      {status === "uploading" ? (
        <span className="text-[12px] text-ink/50">Enviando…</span>
      ) : status === "done" ? (
        <span className="text-[12px] text-moss">PDF pronto — clique em Salvar para confirmar.</span>
      ) : status === "error" ? (
        <span className="text-[12px] text-terracotta">{error}</span>
      ) : hasExisting ? (
        <span className="text-[12px] text-ink/40">Escolha um arquivo pra substituir o atual.</span>
      ) : null}
    </div>
  );
}
