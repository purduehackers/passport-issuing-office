import Image from "next/image";
import { getLatestPassport } from "@/lib/get-latest-passport";
import { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { auth } from "@/auth";
import { MySession } from "@/types/types";
import { PreviewPageLink } from "@/components/preview-page-link";

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
    title: `Make your Purdue Hackers passport with ${latestPassport.name}`,
    description:
      "NFC-enabled passports that level you up. Generate yours here, then put it together at Hack Night.",
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

  let session = (await auth()) as MySession | null;

  return (
    <div className="min-h-screen flex flex-col mt-24 sm:mt-0 sm:justify-center items-center">
      <div className="w-11/12 sm:w-auto flex flex-col gap-4">
        <Image
          alt={`Passport for discord id ${latestPassport.id}`}
          src={`${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw,
          70vw"
          style={{
            width: "auto",
            height: "auto",
            borderRadius: "8px",
          }}
        />
        <div className="grid grid-cols-3">
          <p>two</p>
          <PreviewPageLink>
            <Button type="button" className="w-full mx-auto">
              {session ? "View yours" : "Make yours"}
            </Button>
          </PreviewPageLink>
          <Dialog>
            <DialogTrigger className="w-fit ml-auto">
              <a
                href="#"
                className="text-gray-400 flex justify-center items-center gap-1"
              >
                <Info size={16} />
                <p>What&#39;s this?</p>
              </a>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
