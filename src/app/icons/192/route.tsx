import { ImageResponse } from "next/og";
import { pwaIcon } from "@/lib/pwaIcon";

export function GET() {
  return new ImageResponse(pwaIcon({ size: 192 }), { width: 192, height: 192 });
}
