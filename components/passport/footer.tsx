import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";

export function FooterSection({
  topLine,
  bottomLine,
}: {
  topLine: string;
  bottomLine: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        position: "absolute",
        top: 282.333 * IMAGE_GENERATION_SCALE_FACTOR,
        left: 16 * IMAGE_GENERATION_SCALE_FACTOR,
        gap: 4 * IMAGE_GENERATION_SCALE_FACTOR,
      }}
    >
      <div
        style={{
          color: "#4A2BA6",
          textAlign: "center",
          fontFamily: '"OCR B"',
          fontSize: 12 * IMAGE_GENERATION_SCALE_FACTOR,
          fontStyle: "normal",
          fontWeight: 500,
          textTransform: "uppercase",
          height: 14 * IMAGE_GENERATION_SCALE_FACTOR,
          width: 440 * IMAGE_GENERATION_SCALE_FACTOR,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {topLine.split("").map((char, i) => (
          <span key={`footer-top-${i}`}>{char}</span>
        ))}
      </div>
      <div
        style={{
          color: "#4A2BA6",
          textAlign: "center",
          fontFamily: '"OCR B"',
          fontSize: 12 * IMAGE_GENERATION_SCALE_FACTOR,
          fontStyle: "normal",
          fontWeight: 500,
          textTransform: "uppercase",
          height: 14 * IMAGE_GENERATION_SCALE_FACTOR,
          width: 440 * IMAGE_GENERATION_SCALE_FACTOR,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {bottomLine.split("").map((char, i) => (
          <span key={`footer-bottom-${i}`}>{char}</span>
        ))}
      </div>
    </div>
  );
}
