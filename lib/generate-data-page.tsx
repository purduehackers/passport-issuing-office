interface ExpectedData {
  passportNumber: number;
  surname: string;
  firstName: string;
  dateOfBirth: Date;
  dateOfIssue: Date;
  placeOfOrigin: string;
  portrait: File;
}

import { DataSection } from "@/components/passport/data";
import { FooterSection } from "@/components/passport/footer";
import { ImageSection } from "@/components/passport/image";
import {
  CURRENT_PASSPORT_VERSION,
  IMAGE_GENERATION_SCALE_FACTOR,
} from "@/config";
import { ImageResponse } from "next/og";

export async function generateDataPage(
  data: ExpectedData
): Promise<ImageResponse> {
  const portraitImageBuffer = Buffer.from(await data.portrait.arrayBuffer());
  const portraitUrlB64 =
    `data:${data.portrait.type};base64,` +
    portraitImageBuffer.toString("base64");

  const interFontData = await fetch(
    new URL("../assets/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBoldFontData = await fetch(
    new URL("../assets/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const OCRBProFontData = await fetch(
    new URL("../assets/OCRB-Regular.ttf", import.meta.url)
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
          <ImageSection
            imageUrl={portraitUrlB64 ?? "https://doggo.ninja/j8F9pT.png"}
          />
          <DataSection
            version={CURRENT_PASSPORT_VERSION}
            passportNumber={data.passportNumber}
            id={data.passportNumber}
            surname={data.surname}
            firstName={data.firstName}
            dateOfBirth={data.dateOfBirth}
            dateOfIssue={data.dateOfIssue}
            placeOfOrigin={data.placeOfOrigin}
          />
        </div>
        <FooterSection
          topLine={`PH<HAK${data.surname}<<${data.firstName}`.padEnd(44, "<")}
          bottomLine={`${String(CURRENT_PASSPORT_VERSION).padStart(
            3,
            "0"
          )}${String(data.passportNumber).padStart(6, "0")}${
            (CURRENT_PASSPORT_VERSION + data.passportNumber) % 10
          }HAK${String(data.dateOfBirth.getFullYear()).padStart(
            4,
            "0"
          )}${String(data.dateOfBirth.getMonth() + 1).padStart(2, "0")}${String(
            data.dateOfBirth.getDate()
          ).padStart(2, "0")}${
            (data.dateOfBirth.getFullYear() +
              data.dateOfBirth.getMonth() +
              data.dateOfBirth.getDate()) %
            10
          }<${String(data.dateOfIssue.getFullYear()).padStart(4, "0")}0101${
            (data.dateOfIssue.getFullYear() + 2) % 10
          }<<<<<<<<<<0${
            (CURRENT_PASSPORT_VERSION +
              data.passportNumber +
              (data.dateOfBirth.getFullYear() +
                data.dateOfBirth.getMonth() +
                data.dateOfBirth.getDate()) +
              (data.dateOfIssue.getFullYear() + 2)) %
            10
          }`}
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
