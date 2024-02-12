import { Passport } from "@/types/types";
import Image from "next/image";
import { ImageActions } from "./image-actions";

export function ActivatedView({
  userId,
  latestPassport,
}: {
  userId: string | undefined;
  latestPassport: Passport;
}) {
  const latestPassportImageUrl = `${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`;
  return (
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
          Here&rsquo;s the passport you generated. You can download it, share
          it, or make a new one.
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
  );
}
