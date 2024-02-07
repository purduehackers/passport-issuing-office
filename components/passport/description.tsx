import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";

export function Description({
  title,
  content,
  width,
  directToDom,
}: {
  title: string;
  content?: string;
  width?: number;
  directToDom?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: width ?? "auto",
        gap: 2 * IMAGE_GENERATION_SCALE_FACTOR,
      }}
    >
      <div
        style={{
          color: "#4A2AA6",
          fontFamily: directToDom ? "var(--font-inter)" : '"Inter"',
          fontSize: 8 * IMAGE_GENERATION_SCALE_FACTOR,
          fontStyle: "normal",
          fontWeight: 500,
          letterSpacing: 0.64 * IMAGE_GENERATION_SCALE_FACTOR,
          textTransform: "uppercase",
          height: 10 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#000000",
          fontFamily: directToDom ? "var(--font-ocr)" : '"OCR B"',
          fontSize: 11 * IMAGE_GENERATION_SCALE_FACTOR,
          fontStyle: "normal",
          fontWeight: 500,
          letterSpacing: 2.667 * IMAGE_GENERATION_SCALE_FACTOR,
          textTransform: "uppercase",
          height: 13 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      >
        {content}
      </div>
    </div>
  );
}
