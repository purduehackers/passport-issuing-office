import { Passport } from "@/components/passport";
import { IMAGE_GENERATION_SCALE_FACTOR } from "@/config";
import { ExpectedData } from "@/types/types";
import { ImageResponse } from "next/og";

export async function fetchAssets(data: ExpectedData, url?: string) {
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

  return {
    portraitUrlB64,
    dataPageBgUrl,
    interFontData,
    interBoldFontData,
    OCRBProFontData,
  };
}

export async function generateDataPage(
  data: ExpectedData,
  url?: string
): Promise<ImageResponse> {
  const {
    portraitUrlB64,
    dataPageBgUrl,
    interFontData,
    interBoldFontData,
    OCRBProFontData,
  } = await fetchAssets(data, url);

  return new ImageResponse(
    (
      <Passport
        data={data}
        portraitUrlB64={portraitUrlB64}
        dataPageBgUrl={dataPageBgUrl}
      />
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

export async function generateFullFrame(data: ExpectedData, url?: string) {
  const {
    interFontData,
    interBoldFontData,
    OCRBProFontData,
    dataPageBgUrl,
    portraitUrlB64,
  } = await fetchAssets(data, url);

  // const dataPage = Buffer.from(
  //   await (await generateDataPage(data, url)).arrayBuffer()
  // );
  // const dataPageUrlB64 = "data:image/png;base64," + dataPage.toString("base64");

  const secondHalfUrl = `${process.env.R2_PUBLIC_URL}/page-1-second-half.png`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 324.63 * IMAGE_GENERATION_SCALE_FACTOR,
            height: 475.86 * IMAGE_GENERATION_SCALE_FACTOR,
          }}
        >
          <Passport
            data={data}
            dataPageBgUrl={dataPageBgUrl}
            portraitUrlB64={portraitUrlB64}
          />
        </div>
        <img
          src={secondHalfUrl}
          width={324.63 * IMAGE_GENERATION_SCALE_FACTOR}
          height={475.86 * IMAGE_GENERATION_SCALE_FACTOR}
          style={{ marginLeft: "-100%" }}
        />
      </div>
    ),
    {
      width: 794.66 * IMAGE_GENERATION_SCALE_FACTOR,
      height: 1028.49 * IMAGE_GENERATION_SCALE_FACTOR,
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
