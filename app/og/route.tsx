import { DataSection } from "@/components/passport/data";
import { FooterSection } from "@/components/passport/footer";
import { ImageSection } from "@/components/passport/image";
import {
  CURRENT_PASSPORT_VERSION,
  IMAGE_GENERATION_SCALE_FACTOR,
} from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

interface ExpectedData {
  passportNumber: number;
  surname: string;
  firstName: string;
  dateOfBirth: Date;
  dateOfIssue: Date;
  placeOfOrigin: string;
  portrait: File;
}

async function SatoriImageResponse(data: ExpectedData) {
  const portraitImageBuffer = Buffer.from(await data.portrait.arrayBuffer());
  const portraitUrlB64 =
    `data:${data.portrait.type};base64,` +
    portraitImageBuffer.toString("base64");

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

export async function POST(request: Request) {
  const formValues = await request.formData();

  // TODO: fix types

  const trueID = formValues.get("passportNumber")
    ? Number(formValues.get("passportNumber") as string)
    : 0;

  const trueSurname = formValues.get("surname")
    ? (formValues.get("surname") as string)
    : "HACKER";
  const trueFirstName = formValues.get("firstName")
    ? (formValues.get("firstName") as string)
    : "WACK";

  const trueDateOfBirth = new Date(
    formValues.get("dateOfBirth")
      ? (formValues.get("dateOfBirth") as string)
      : "06 Apr 1200"
  );
  const trueDateOfIssue = new Date(
    formValues.get("dateOfIssue")
      ? (formValues.get("dateOfIssue") as string)
      : Date.now()
  );
  const placeOfOrigin = formValues.get("placeOfOrigin")
    ? (formValues.get("placeOfOrigin") as string)
    : "THE WOODS";
  const portraitImage = formValues.get("portrait") as File;

  return await SatoriImageResponse({
    passportNumber: trueID,
    surname: trueSurname,
    firstName: trueFirstName,
    dateOfBirth: trueDateOfBirth,
    dateOfIssue: trueDateOfIssue,
    placeOfOrigin,
    portrait: portraitImage,
  });
}

export async function GET(_req: Request) {
  const defaultImageRes = await fetch("https://doggo.ninja/j8F9pT.png");
  const defaultImageBlob = await defaultImageRes.blob();
  const defaultImage = new File([defaultImageBlob], "default_image.png", {
    type: "image/png",
  });

  return await SatoriImageResponse({
    passportNumber: 0,
    surname: "HACKER",
    firstName: "WACK",
    dateOfBirth: new Date("06 Apr 1200"),
    dateOfIssue: new Date(),
    placeOfOrigin: "THE WOODS",
    portrait: defaultImage,
  });
}
