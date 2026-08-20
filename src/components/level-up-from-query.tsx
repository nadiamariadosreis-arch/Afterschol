"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LevelUpModal } from "./level-up-modal";

function LevelUpFromQueryInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("levelup");
  const level = raw ? Number(raw) : null;

  function close() {
    router.replace(pathname);
  }

  return <LevelUpModal level={level} onClose={close} />;
}

export function LevelUpFromQuery() {
  return (
    <Suspense fallback={null}>
      <LevelUpFromQueryInner />
    </Suspense>
  );
}
