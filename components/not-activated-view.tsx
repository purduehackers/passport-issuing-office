import { MySession, Passport } from "@/types/types";
import { SignInButton } from "./auth-buttons";
import Playground from "./playground";

export function NewPassportView({
  userId,
  session,
  latestPassport,
  latestPassportImageUrl,
}: {
  userId: string | undefined;
  session: MySession | null | undefined;
  latestPassport: Passport | null | undefined;
  latestPassportImageUrl: string | null;
}) {
  return (
    <>
      <div>
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
            Use this website to create your passport data page. 🛂
          </p>
          <p className="text-base">
            The info can be whatever you want. Some people have put their real
            info, others have put totally wacky stuff. Half of the passports
            have a cat set as their portrait.
          </p>{" "}
          {userId ? (
            <p className="text-base">
              When you&#39;re ready to register for a passport ceremony, check
              the checkbox to be assigned a passport number. Your passport will
              be printed & ready to assemble at the next ceremony.
            </p>
          ) : null}
        </div>
        {!session?.user?.email ? (
          <div className="bg-slate-200 text-black rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-7/12 gap-2 p-2 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-500 shadow-blocks-sm font-main">
            <p>
              You are currently in Playground Mode: you can play with a data
              page & it will not be shared with us. To save your page and
              register for a passport ceremony, you&#39;ll need to sign in.
            </p>
            <SignInButton />
          </div>
        ) : null}
      </div>
      <Playground
        userId={userId}
        latestPassport={latestPassport}
        latestPassportImageUrl={latestPassportImageUrl}
      />
    </>
  );
}
