import Playground from "@/components/playground";
import { generateDataPage } from "@/lib/generate-data-page";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function Home() {
  const defaultImageRes: ImageResponse = await generateDataPage({
    passportNumber: 0,
    surname: "HACKER",
    firstName: "WACK",
    dateOfBirth: new Date("06 Apr 1200"),
    dateOfIssue: new Date(),
    placeOfOrigin: "THE WOODS",
  });
  const defaultImageBlob = await defaultImageRes.blob();
  const defaultImageBuffer = Buffer.from(await defaultImageBlob.arrayBuffer());
  const defaultImageUrl =
    "data:image/png;base64," + defaultImageBuffer.toString("base64");

  return (
    <main className="flex min-h-screen flex-col items-center gap-y-12 sm:gap-y-24 p-4 sm:p-24 bg-slate-900">
      <div className="bg-slate-200 text-black rounded-sm border-[3px] border-amber-400 flex flex-col justify-center gap-2 p-2 sm:p-4 my-4 print:my-0 print:mt-4 w-full md:w-9/12 print:w-9/12 mx-auto break-inside-avoid shadow-amber-500 shadow-blocks-sm font-main">
        <h1 className="font-bold text-3xl sm:text-6xl mx-auto mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <img
            alt="passport cover"
            src="/cover-black.svg"
            className="self-center flex-shrink-0 h-16 sm:h-[1em] w-auto pointer-events-none"
          />
          Passport Data Pages
        </h1>
        <p className="text-base">
          Use this website to create your passport data page. 🛂
        </p>
        <p className="text-base">
          The info can be whatever you want. Some people have put their real
          info, others have put totally wacky stuff. Half of the passports have
          a cat set as their portrait.
        </p>{" "}
        <p className="text-base">
          Once you&#39;ve made your data page, download it and send it to
          Matthew on Discord (hewillyeah).
        </p>
      </div>
      <Playground defaultImageUrl={defaultImageUrl} />
    </main>
  );
}
