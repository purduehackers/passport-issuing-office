import { Passport } from "@/components/passport";
import { DataSection } from "@/components/passport/data";
import { FooterSection } from "@/components/passport/footer";
import { ImageSection } from "@/components/passport/image";
import {
  CURRENT_PASSPORT_VERSION,
  IMAGE_GENERATION_SCALE_FACTOR,
} from "@/config";
import { PassportGenData } from "@/types/types";
import { ImageResponse } from "next/og";

export async function generateDataPage(
  data: PassportGenData,
  url?: string
): Promise<ImageResponse> {
  let portrait: File;
  if (data.portrait) {
    portrait = data.portrait;
  } else {
    const defaultPortraitUrl = new URL(
      "/passport/no-image.png",
      url ?? "https://passport-data-pages.vercel.app"
    ).href;
    const defaultPortraitRes = await fetch(defaultPortraitUrl);
    const defaultPortraitBlob = await defaultPortraitRes.blob();
    portrait = new File([defaultPortraitBlob], "default_portrait.png", {
      type: "image/png",
    });
  }

  const portraitImageBuffer = Buffer.from(await portrait.arrayBuffer());
  const portraitUrlB64 =
    `data:${portrait.type};base64,` + portraitImageBuffer.toString("base64");

  const interFontData = await fetch(
    new URL("../assets/Inter-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBoldFontData = await fetch(
    new URL("../assets/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const OCRBProFontData = await fetch(
    new URL("../assets/OCRB-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  // const dataPageBgUrl = new URL(
  //   "/passport/data-page-bg.png",
  //   url ?? "https://passport-data-pages.vercel.app"
  // ).href;

  // ^ That randomly stopped working in production, no idea why.
  // Temporary solution I guess?
  const dataPageBgUrl = `${process.env.R2_PUBLIC_URL}/data-page-bg.png`;

  return new ImageResponse(
    (
      // <Passport data={data} directToDom={false} />,
      <div
        style={{
          fontSize: 40,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        👋 Hello
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
