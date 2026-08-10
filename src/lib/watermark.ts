import "server-only";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

/**
 * Stamps a discreet diagonal watermark (member name + e-mail) across every
 * page — light enough not to get in the way of printing, present enough to
 * discourage sharing.
 */
export async function watermarkPdf(pdfBytes: Uint8Array, label: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    // Tile the watermark diagonally so cropping a page doesn't remove it.
    const stepX = textWidth + 90;
    const stepY = 130;

    for (let y = -height; y < height * 2; y += stepY) {
      for (let x = -width; x < width * 2; x += stepX) {
        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.35, 0.32, 0.27),
          opacity: 0.12,
          rotate: degrees(35),
        });
      }
    }
  }

  return pdfDoc.save();
}
