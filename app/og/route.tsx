import { DataSection } from "@/components/passport/data";
import { FooterSection } from "@/components/passport/footer";
import { ImageSection } from "@/components/passport/image";
import {
  CURRENT_PASSPORT_VERSION,
  IMAGE_GENERATION_SCALE_FACTOR,
} from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      id?: string;
      surname?: string;
      givenName?: string;
      dateOfBirth?: string;
      placeOfOrigin?: string;
      dateOfIssue?: string;
      image?: string;
    };
  }
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

  const trueID = Number.parseInt(params.id ? params.id : `0`);

  const trueSurname = params.surname ? params.surname : "HACKER";
  const trueGivenName = params.givenName ? params.givenName : "WACK";

  const trueDateOfBirth = new Date(params.dateOfBirth ? params.dateOfBirth : "06 Apr 1200");
  const trueDateOfIssue = new Date(params.dateOfIssue ? params.dateOfIssue : Date.now());

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
            image={params.image ?? "https://doggo.ninja/j8F9pT.png"}
          />
          <DataSection
            version={CURRENT_PASSPORT_VERSION}
            id={trueID}
            surname={trueSurname}
            givenName={trueGivenName}
            dateOfBirth={trueDateOfBirth}
            dateOfIssue={trueDateOfIssue}
            placeOfOrigin={
              params.placeOfOrigin ? params.placeOfOrigin : "The woods"
            }
          />
        </div>
        <FooterSection
          topLine={`PH<HAK${trueSurname}<<${trueGivenName}`.padEnd(44, '<')}
          bottomLine={`${
            String(CURRENT_PASSPORT_VERSION).padStart(3, '0')
          }${
            String(trueID).padStart(6, '0')
          }${
            (CURRENT_PASSPORT_VERSION + trueID) % 10
          }HAK${
            String(trueDateOfBirth.getFullYear()).padStart(4, '0')
          }${
            String(trueDateOfBirth.getMonth() + 1).padStart(2, '0')
          }${
            String(trueDateOfBirth.getDate()).padStart(2, '0')
          }${
            (trueDateOfBirth.getFullYear() + trueDateOfBirth.getMonth() + trueDateOfBirth.getDate()) % 10
          }<${
            String(trueDateOfIssue.getFullYear()).padStart(4, '0')
          }0101${
            (trueDateOfIssue.getFullYear() + 2) % 10
          }<<<<<<<<<<0${
            ((CURRENT_PASSPORT_VERSION + trueID) + (trueDateOfBirth.getFullYear() + trueDateOfBirth.getMonth() + trueDateOfBirth.getDate()) + (trueDateOfIssue.getFullYear() + 2)) % 10
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
