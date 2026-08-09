import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "active_child_profile";

export async function getActiveChildProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setActiveChildProfileId(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
