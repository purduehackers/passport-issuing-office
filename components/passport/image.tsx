import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { Description } from "./description";

export function ImageSection({ image }: { image: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22 * IMAGE_GENERATION_SCALE_FACTOR,
      }}
    >
      <div
        style={{
          color: "#4A2AA6",
          fontFamily: '"Inter Bold"',
          fontSize: 8 * IMAGE_GENERATION_SCALE_FACTOR,
          fontStyle: "normal",
          fontWeight: 800,
          letterSpacing: 1.16 * IMAGE_GENERATION_SCALE_FACTOR,
          textTransform: "uppercase",
          height: 12 * IMAGE_GENERATION_SCALE_FACTOR,
          width: 73 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      >
        PASSPORT
      </div>

      <img
        src={image}
        alt="Your Passport Photo Here!"
        style={{
          width: 148 * IMAGE_GENERATION_SCALE_FACTOR,
          height: 185 * IMAGE_GENERATION_SCALE_FACTOR,
          objectFit: "cover",
          borderRadius: 8 * IMAGE_GENERATION_SCALE_FACTOR,
        }}
      />
    </div>
  );
}
