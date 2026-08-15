import { ImageResponse } from "next/og";
import { pwaIcon } from "@/lib/pwaIcon";

// Full-bleed variant for Android adaptive icons — the OS crops this to its
// own shape (circle, squircle, etc.), so the mark stays inside a safe zone.
export function GET() {
  return new ImageResponse(pwaIcon({ size: 512, maskable: true }), { width: 512, height: 512 });
}
