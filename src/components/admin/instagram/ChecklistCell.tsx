"use client";

import { useOptimistic, useTransition } from "react";
import { toggleStepAction } from "@/app/admin/instagram/actions";
import type { ChecklistField } from "@/lib/instagram";

export function ChecklistCell({
  accountId,
  postId,
  field,
  checked,
  label,
}: {
  accountId: string;
  postId: string;
  field: ChecklistField;
  checked: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      aria-label={label}
      title={label}
      checked={optimistic}
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          setOptimistic(next);
          await toggleStepAction(accountId, postId, field, next);
        });
      }}
      className={`w-[18px] h-[18px] accent-moss cursor-pointer ${pending ? "opacity-50" : ""}`}
    />
  );
}
