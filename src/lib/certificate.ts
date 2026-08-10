import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

function centeredText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color: ReturnType<typeof rgb>,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

const MOSS = rgb(0.29, 0.36, 0.27);
const GOLD = rgb(0.69, 0.55, 0.27);
const INK = rgb(0.18, 0.16, 0.13);

export async function generateCertificate({
  childName,
  trackName,
  weeksCompleted,
  completedAt,
}: {
  childName: string;
  trackName: string;
  weeksCompleted: number;
  completedAt: Date;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 paisagem

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const { width, height } = page.getSize();

  // Molduras decorativas.
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: MOSS,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: GOLD,
    borderWidth: 1,
  });

  centeredText(page, "T R I L H A   D A S   V I R T U D E S", serifBold, 13, height - 100, GOLD);

  centeredText(page, "Certificado de Conclusão", serifItalic, 34, height - 165, INK);

  centeredText(page, "Certificamos que", serif, 16, height - 235, INK);

  centeredText(page, childName, serifItalic, 40, height - 290, MOSS);

  centeredText(
    page,
    "concluiu, com dedicação, todas as semanas da",
    serif,
    16,
    height - 335,
    INK,
  );

  centeredText(page, trackName, serifBold, 22, height - 368, INK);

  // Pequeno ornamento entre o corpo e o rodapé.
  const dividerY = height - 410;
  page.drawLine({
    start: { x: width / 2 - 60, y: dividerY },
    end: { x: width / 2 - 12, y: dividerY },
    thickness: 1,
    color: GOLD,
  });
  page.drawCircle({ x: width / 2, y: dividerY, size: 3, color: GOLD });
  page.drawLine({
    start: { x: width / 2 + 12, y: dividerY },
    end: { x: width / 2 + 60, y: dividerY },
    thickness: 1,
    color: GOLD,
  });

  const dateLabel = completedAt.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  centeredText(
    page,
    `${weeksCompleted} semana${weeksCompleted === 1 ? "" : "s"} concluídas · ${dateLabel}`,
    serif,
    12,
    70,
    INK,
  );

  return pdfDoc.save();
}
