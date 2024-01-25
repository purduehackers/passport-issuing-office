import { DataSection } from "@/components/passport/data";
import { FooterSection } from "@/components/passport/footer";
import { ImageSection } from "@/components/passport/image";
import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { name: string; origin: string; dob: string } }
) {
  const interFontData = await fetch(
    new URL("../../assets/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBoldFontData = await fetch(
    new URL("../../assets/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const OCRBProFontData = await fetch(
    new URL("../../assets/OCRB-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 13.333 * IMAGE_GENERATION_SCALE_FACTOR,
          fontFamily: '"Inter"',
          color: "black",
          backgroundImage: `url('https://doggo.ninja/fVcYpE.png')`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          padding: `${16 * IMAGE_GENERATION_SCALE_FACTOR}px ${
            24 * IMAGE_GENERATION_SCALE_FACTOR
          }px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            position: "absolute",
            top: 24 * IMAGE_GENERATION_SCALE_FACTOR,
            left: 16 * IMAGE_GENERATION_SCALE_FACTOR,
            right: 16 * IMAGE_GENERATION_SCALE_FACTOR,
            gap: 19 * IMAGE_GENERATION_SCALE_FACTOR,
          }}
        >
          <ImageSection image={new Blob()} />
          <DataSection
            version={0}
            no={1}
            surname="Hacker"
            givenName="Wack"
            dateOfBirth={new Date("06 APR 1200")}
            dateOfIssue={new Date(Date.now())}
            placeOfOrigin="The Deep Sea"
          />
        </div>
        <FooterSection
          topLine="P<HAKHACKER<WACK<<<<<<<<<<<<<<<<<<<<<<<<<<<"
          bottomLine="E042901AA3USA3299FF47983<<<<<<<<<<<<<<<<069"
        />
      </div>
    ),
    {
      width: 472 * IMAGE_GENERATION_SCALE_FACTOR,
      height: 322 * IMAGE_GENERATION_SCALE_FACTOR,
      fonts: [
        {
          name: "Inter",
          data: interFontData,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter Bold",
          data: interBoldFontData,
          style: "normal",
          weight: 800,
        },
        {
          name: "OCR B",
          data: OCRBProFontData,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
