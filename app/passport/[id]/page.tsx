import Image from "next/image";
import { getLatestPassport } from "@/lib/get-latest-passport";
import { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const latestPassport = await getLatestPassport(params.id);
  if (!latestPassport) {
    return {
      title: "Passport Data Pages",
      description: "Customize your passport data page!",
    };
  }

  const r2PassportUrl = `${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`;

  return {
    metadataBase: new URL(
      "https://passport-data-pages-git-dynamic-og-image-purdue-hackers.vercel.app/"
    ),
    title: `Make your passport with ${latestPassport.name}!`,
    description:
      "NFC-enabled passports that level you up. Generate it here, then put it together at Hack Night.",
    openGraph: {
      images: [r2PassportUrl],
    },
  };
}

export default async function Passport({ params }: Props) {
  const latestPassport = await getLatestPassport(params.id);
  if (!latestPassport) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-11/12 sm:w-auto max-w-md">
        <Image
          alt={`Passport for discord id ${latestPassport.id}`}
          src={`${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw,
          (max-width: 1024px) 50vw,
          33vw"
          style={{
            width: "auto",
            height: "auto",
            borderRadius: "8px",
          }}
        />
        <p>test</p>
      </div>
    </div>
  );
}
