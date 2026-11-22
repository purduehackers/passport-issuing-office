import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import { BOOKLET_PAGE_HEIGHT, BOOKLET_PAGE_WIDTH, unitsToPoints } from "../print";

const LETTER = { width: 612, height: 792 };
const PER_SHEET = 2;
const GAP = 12;
const MARK = 14;
const MARK_OFFSET = 4;

/**
 * Builds a print-ready PDF: on each US Letter sheet, two passports, each a data page beside the visa page.
 * Marks show where to cut. Dashed marks show the fold between the two booklet pages.
 */
export async function buildPassportPdf(dataPages: Uint8Array[], visaPage: Uint8Array) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Purdue Hackers passports");
  pdf.setCreator("Passport Issuing Office");
  const visa = await pdf.embedJpg(visaPage);
  const w = unitsToPoints(BOOKLET_PAGE_WIDTH);
  const h = unitsToPoints(BOOKLET_PAGE_HEIGHT);
  const x = (LETTER.width - 2 * w) / 2;
  const top = (LETTER.height - (PER_SHEET * h + (PER_SHEET - 1) * GAP)) / 2;

  for (let i = 0; i < dataPages.length; i += PER_SHEET) {
    const sheet = pdf.addPage([LETTER.width, LETTER.height]);
    sheet.drawRectangle({ x: 0, y: 0, width: LETTER.width, height: LETTER.height, color: rgb(1, 1, 1) });
    const slots = dataPages.slice(i, i + PER_SHEET);
    for (const [k, bytes] of slots.entries()) {
      const y = LETTER.height - (top + k * (h + GAP)) - h;
      sheet.drawImage(await pdf.embedJpg(bytes), { x, y, width: w, height: h });
      sheet.drawImage(visa, { x: x + w, y, width: w, height: h });
      drawMarks(sheet, x, y, 2 * w, h, k === 0, k === slots.length - 1);
    }
  }
  return pdf.save();
}

/** Cut marks around a strip of two booklet pages, and dashed fold marks at its middle. */
function drawMarks(sheet: PDFPage, x: number, y: number, width: number, h: number, first: boolean, last: boolean) {
  const line = (x1: number, y1: number, x2: number, y2: number, dashed = false) =>
    sheet.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 0.4,
      color: rgb(0, 0, 0),
      dashArray: dashed ? [2, 2] : undefined,
    });
  for (const edge of [y, y + h]) {
    line(x - MARK_OFFSET - MARK, edge, x - MARK_OFFSET, edge);
    line(x + width + MARK_OFFSET, edge, x + width + MARK_OFFSET + MARK, edge);
  }
  for (const [edge, dashed] of [[x, false], [x + width / 2, true], [x + width, false]] as const) {
    if (first) line(edge, y + h + MARK_OFFSET, edge, y + h + MARK_OFFSET + MARK, dashed);
    if (last) line(edge, y - MARK_OFFSET, edge, y - MARK_OFFSET - MARK, dashed);
  }
}

/**
 * The stamp pages: 3 sheets, printed double-sided, so 4 strips of 4 pages each.
 * Cut from purduehackers/passports files/stamp-pages.pdf, at the size each sheet printed at when fitted to Letter.
 * The inner sheets are slightly narrower on purpose, so the nested pages line up at the open edge.
 */
const STAMP_SHEETS = [
  [{ front: "1-front.jpg", back: "1-back.jpg", width: 500.54, height: 366.44 }],
  [
    { front: "2-top-front.jpg", back: "2-top-back.jpg", width: 494.8, height: 366.44 },
    { front: "2-bottom-front.jpg", back: "2-bottom-back.jpg", width: 494.8, height: 366.44 },
  ],
  [{ front: "3-front.jpg", back: "3-back.jpg", width: 488.63, height: 366.44 }],
];

/**
 * Builds the stamp pages for `sets` passports, one collated set after another.
 * Each strip is centered, so its front and back line up when the sheet is printed double-sided.
 */
export async function buildStampPdf(sets: number, load: (file: string) => Promise<Uint8Array>) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Purdue Hackers passport stamp pages");
  pdf.setCreator("Passport Issuing Office");
  const files = STAMP_SHEETS.flat().flatMap((spread) => [spread.front, spread.back]);
  const images = new Map(await Promise.all(files.map(async (file) => [file, await pdf.embedJpg(await load(file))] as const)));

  for (let set = 0; set < sets; set++) {
    for (const spreads of STAMP_SHEETS) {
      const height = spreads.reduce((sum, s) => sum + s.height, 0) + GAP * (spreads.length - 1);
      for (const side of ["front", "back"] as const) {
        const sheet = pdf.addPage([LETTER.width, LETTER.height]);
        sheet.drawRectangle({ x: 0, y: 0, width: LETTER.width, height: LETTER.height, color: rgb(1, 1, 1) });
        let top = (LETTER.height - height) / 2;
        for (const [k, spread] of spreads.entries()) {
          const x = (LETTER.width - spread.width) / 2;
          const y = LETTER.height - top - spread.height;
          sheet.drawImage(images.get(spread[side])!, { x, y, width: spread.width, height: spread.height });
          if (side === "front") drawMarks(sheet, x, y, spread.width, spread.height, k === 0, k === spreads.length - 1);
          top += spread.height + GAP;
        }
      }
    }
  }
  return pdf.save();
}
