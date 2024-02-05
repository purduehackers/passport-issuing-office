import { auth } from "@/auth";
import { SignInButton } from "@/components/auth-buttons";
import Playground from "@/components/playground";
import UserInfo from "@/components/user-info";

export const runtime = "edge";

export default async function Home() {
  let session = await auth();
  return (
    <main className="bg-slate-900 flex flex-col min-h-screen">
      <UserInfo user={session?.user} />
      <div className="flex flex-col items-center gap-y-12 sm:gap-y-24 p-4 sm:p-24">
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
            <p className="text-base">
              Once you&#39;ve made your data page, download it and send it to
              Matthew on Discord (hewillyeah).
            </p>
          </div>
          {!session?.user?.email ? (
            <div className="bg-slate-200 text-black rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-7/12 gap-2 p-2 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-500 shadow-blocks-sm font-main">
              <p>
                You are currently in Playground Mode: you can play with a data
                page, and it will not be shared with us. To save your page and
                register for a passport ceremony,{" "}
                <span className="font-bold">please sign in.</span>
              </p>
              <SignInButton />
            </div>
          ) : null}
        </div>
        <Playground />
      </div>
    </main>
  );
}
