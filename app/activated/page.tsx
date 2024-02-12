import { auth } from "@/auth";
import UserInfo from "@/components/user-info";
import { MySession } from "@/types/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ImageActions } from "@/components/image-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Activated() {
  // Although the session includes the JWT token type from `auth.ts`, when it gets here
  // next-auth still thinks it doesn't exist, even though it does when I log it.
  // As a temporary workaround, I've created my own Session type which contains
  // what I'm actually getting from next-auth.
  let session = (await auth()) as MySession | null;
  const userId = session?.token.sub;
  const latestPassport = session?.passport;

  if (!latestPassport) {
    notFound();
  }

  const latestPassportImageUrl = `${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`;

  return (
    <main className="bg-slate-900 flex flex-col min-h-screen">
      <UserInfo user={session?.user} />
      <div className="flex flex-col items-center gap-y-12 sm:gap-y-24 p-4 sm:p-24">
        <div className="flex flex-col gap-2 w-full md:w-9/12 mx-auto">
          <div className="bg-slate-200 text-black rounded-sm border-[3px] border-amber-400 flex flex-col justify-center gap-2 p-2 sm:p-4 my-4 break-inside-avoid shadow-amber-500 shadow-blocks-sm font-main">
            <h1 className="font-bold text-3xl sm:text-6xl mx-auto mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <img
                alt="passport cover"
                src="/cover-black.svg"
                className="self-center flex-shrink-0 h-16 sm:h-[1em] w-auto pointer-events-none"
              />
              Your Passport
            </h1>
            <p className="text-base">
              Your passport is activated! Here&rsquo;s the data page you
              generated. You can download it, share it, or make a new one.
            </p>
          </div>
          <div className="w-full md:w-8/12 mx-auto flex flex-col gap-2">
            <Image
              alt={`Passport for discord id ${latestPassport.id}`}
              src={latestPassportImageUrl}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "auto",
                height: "auto",
                borderRadius: "8px",
              }}
            />
            <ImageActions
              generatedImageUrl={latestPassportImageUrl}
              userId={userId}
              latestPassport={latestPassport}
              firstName={latestPassport.name}
              surname={latestPassport.surname}
            />
          </div>
        </div>
        <div className="bg-slate-200 text-black rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-7/12 gap-2 p-2 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-500 shadow-blocks-sm font-main">
          <h1 className="font-bold text-center text-2xl">
            Make a new passport?
          </h1>
          <p>
            Your current passport is activated. You can make a new passport at
            any time. We are resource-constrained, though, so please only do so
            if you feel like you need a new one or there&rsquo;s a problem with
            your current one!
          </p>
          <Link href="/?new=true" className="mx-auto mt-2">
            <Button type="button" className="font-bold">
              New Passport
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
