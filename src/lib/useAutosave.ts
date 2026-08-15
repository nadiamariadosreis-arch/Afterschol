"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/** Debounced autosave: calls `save` a bit after `payload` stops changing. */
export function useAutosave<T>(payload: T, save: (payload: T) => Promise<void>, delay = 1500) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string | null>(null);
  const serialized = JSON.stringify(payload);

  useEffect(() => {
    if (lastSaved.current === null) {
      // First render — this is the initial value loaded from the server, not a change to save.
      lastSaved.current = serialized;
      return;
    }
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await save(payload);
        lastSaved.current = serialized;
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  return status;
}
