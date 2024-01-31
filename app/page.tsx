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
    <main className="flex min-h-screen flex-col items-center gap-y-24 p-24">
      <h1 className="font-bold text-amber-400 text-6xl">Passport Data Pages</h1>
      <div className="bg-amber-300 rounded-sm border-2 border-black flex flex-row justify-center align-center gap-2 p-2 my-4 print:my-0 print:mt-4 w-full md:w-9/12 print:w-9/12 mx-auto break-inside-avoid shadow-blocks-sm font-main">
        <p className="text-base">yooo whats up dude</p>
      </div>
      <Playground defaultImageUrl={defaultImageUrl} />
    </main>
  );
}
