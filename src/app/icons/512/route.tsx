import { ImageResponse } from "next/og";
import { pwaIcon } from "@/lib/pwaIcon";

export function GET() {
  return new ImageResponse(pwaIcon({ size: 512 }), { width: 512, height: 512 });
}
