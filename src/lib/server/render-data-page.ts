import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import interBold from "../../assets/fonts/Inter-Bold.ttf?inline";
import interRegular from "../../assets/fonts/Inter-Regular.ttf?inline";
import ocrB from "../../assets/fonts/OCRB-Regular.ttf?inline";
import dataPageBackground from "../../assets/passport/data-page-bg.png?inline";
import portraitBackground from "../../assets/passport/portrait-bg.png?inline";
import {
  CURRENT_PASSPORT_VERSION,
  formatNumber,
  formatPageDate,
  machineReadableZone,
  PAGE_WIDTH,
  parseDate,
  type PassportFields,
} from "../passport";
import { DATA_PAGE_PIXELS } from "../print";

const bytes = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");

const FONTS = [
  { name: "Inter", data: bytes(interRegular), weight: 500 as const, style: "normal" as const },
  { name: "Inter Bold", data: bytes(interBold), weight: 800 as const, style: "normal" as const },
  { name: "OCR B", data: bytes(ocrB), weight: 500 as const, style: "normal" as const },
];

const INK = "#4A2AA6";
const S = DATA_PAGE_PIXELS.width / PAGE_WIDTH;

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});
const div = (style: Record<string, unknown>, ...children: (Node | string)[]) =>
  el("div", { display: "flex", ...style }, ...children);

function field(title: string, content: string, width?: number) {
  return div(
    { flexDirection: "column", gap: 2 * S, ...(width ? { width: width * S } : {}) },
    div(
      { color: INK, fontFamily: "Inter", fontSize: 8 * S, letterSpacing: 0.64 * S, textTransform: "uppercase", height: 10 * S },
      title,
    ),
    div(
      { fontFamily: "OCR B", fontSize: 11 * S, letterSpacing: 2.667 * S, textTransform: "uppercase", height: 13 * S, whiteSpace: "nowrap" },
      content,
    ),
  );
}

function machineLine(text: string) {
  return div(
    {
      justifyContent: "space-between",
      width: 440 * S,
      height: 14 * S,
      color: "#4A2BA6",
      fontFamily: "OCR B",
      fontSize: 12 * S,
    },
    ...[...text].map((char) => el("span", {}, char)),
  );
}

export type DataPageInput = {
  fields: PassportFields;
  passportNumber: number;
  issued: Date;
  portrait: Buffer;
};

/** Renders a print-ready data page, turned upright for the booklet, as a JPEG. */
export async function renderDataPage({ fields, passportNumber, issued, portrait }: DataPageInput) {
  const birth = parseDate(fields.dateOfBirth);
  const expiry = new Date(Date.UTC(issued.getUTCFullYear() + 1000, 0, 1));
  const [top, bottom] = machineReadableZone(fields, passportNumber, issued);
  const photo = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  const page = div(
    {
      position: "relative",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      color: "black",
      fontFamily: "Inter",
      fontSize: 13.333 * S,
      backgroundImage: `url(${dataPageBackground})`,
      backgroundSize: "100% 100%",
    },
    div(
      { position: "absolute", top: 24 * S, left: 16 * S, right: 16 * S, flexDirection: "row", gap: 19 * S },
      div(
        { flexDirection: "column", gap: 22 * S },
        div(
          {
            color: INK,
            fontFamily: "Inter Bold",
            fontSize: 8 * S,
            letterSpacing: 1.16 * S,
            textTransform: "uppercase",
            height: 12 * S,
            width: 73 * S,
          },
          "Passport",
        ),
        div(
          {
            position: "relative",
            width: 148 * S,
            height: 185 * S,
            borderRadius: 8 * S,
            overflow: "hidden",
            backgroundImage: `url(${portraitBackground})`,
            backgroundSize: "100% 100%",
          },
          div({
            position: "absolute",
            top: 0,
            left: 0,
            width: 148 * S,
            height: 185 * S,
            borderRadius: 8 * S,
            border: `${8 * S}px solid rgba(255, 255, 255, 0.75)`,
          }),
          {
            type: "img",
            props: {
              src: photo,
              width: 148 * S,
              height: 185 * S,
              style: { position: "absolute", top: 0, left: 0, objectFit: "cover", mixBlendMode: "color-burn" },
            },
          },
        ),
      ),
      div(
        { flexDirection: "column", gap: 8 * S },
        div(
          { flexDirection: "row", gap: 12 * S },
          field("Type", "PH", 64),
          field("Code", "HAK", 64),
          field("No.", formatNumber(passportNumber, CURRENT_PASSPORT_VERSION)),
        ),
        field("Surname", fields.surname),
        field("Name", fields.firstName),
        field("Nationality", "Republic of Hackerland"),
        div(
          { flexDirection: "row", gap: 48 * S },
          div(
            { flexDirection: "column", gap: 8 * S, width: 104 * S },
            field("Date of birth", birth ? formatPageDate(birth) : ""),
            field("Date of issue", formatPageDate(issued)),
          ),
          div(
            { flexDirection: "column", gap: 8 * S },
            field("Place of origin", fields.placeOfOrigin),
            field("Date of expiration", formatPageDate(expiry)),
          ),
        ),
        field("Authority", "id.purduehackers.com"),
      ),
    ),
    div(
      { position: "absolute", top: 282.333 * S, left: 16 * S, flexDirection: "column", gap: 4 * S },
      machineLine(top),
      machineLine(bottom),
    ),
  );

  const svg = await satori(page as never, { ...DATA_PAGE_PIXELS, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: "original" } }).render().asPng();
  return sharp(png).rotate(90).flatten({ background: "#ffffff" }).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer();
}
