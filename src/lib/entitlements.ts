import type { ProductCode, Track } from "@/lib/supabase/types";

export function hasAccessToTrack(entitlementCodes: ProductCode[], track: Pick<Track, "product_code">) {
  return (
    entitlementCodes.includes("pacote_completo") ||
    entitlementCodes.includes(track.product_code)
  );
}

export function hasAccessToProduct(entitlementCodes: ProductCode[], productCode: ProductCode) {
  return entitlementCodes.includes("pacote_completo") || entitlementCodes.includes(productCode);
}

export function hasAccessToCatalog(entitlementCodes: ProductCode[]) {
  return entitlementCodes.includes("pacote_completo");
}
