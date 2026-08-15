import { ImageResponse } from "next/og";
import { pwaIcon } from "@/lib/pwaIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own rounding/shine to the touch icon, so this is
// full-bleed (no transparency, no baked-in corner radius).
export default function AppleIcon() {
  return new ImageResponse(pwaIcon({ size: 180, maskable: true }), { ...size });
}
