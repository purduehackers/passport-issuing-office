import { Passport } from "@/types/types";
import Image from "next/image";

export function ActivatedView({
  latestPassport,
}: {
  latestPassport: Passport;
}) {
  return (
    <>
      <div className="bg-slate-200 text-black rounded-sm border-[3px] border-amber-400 flex flex-col justify-center gap-2 p-2 sm:p-4 my-4 w-full md:w-9/12 mx-auto break-inside-avoid shadow-amber-500 shadow-blocks-sm font-main">
        <h1 className="font-bold text-3xl sm:text-6xl mx-auto mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <img
            alt="passport cover"
            src="/cover-black.svg"
            className="self-center flex-shrink-0 h-16 sm:h-[1em] w-auto pointer-events-none"
          />
          Passport Data Pages
        </h1>
        <p className="text-base">
          Here&rsquo;s the passport you generated. You can download it, share
          it, or make a new one.
        </p>
      </div>
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
    </>
  );
}
