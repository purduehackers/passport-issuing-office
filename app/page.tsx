import { auth, signIn, signOut } from "@/auth";
import Playground from "@/components/playground";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

export default async function Home() {
  let session = await auth();
  return (
    <main className="flex min-h-screen flex-col items-center gap-y-12 sm:gap-y-24 p-4 sm:p-24 bg-slate-900">
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
        {session?.user?.email ? (
          <div className="bg-slate-200 text-black rounded-sm border-[3px] border-green-400 flex flex-col justify-center w-fit gap-2 p-2 sm:p-4 my-4 mx-auto break-inside-avoid shadow-green-500 shadow-blocks-sm font-main">
            <pre>{JSON.stringify(session, null, 2)}</pre>
            <form
              action={async () => {
                "use server";
                await signOut("discord");
              }}
              className="mx-auto"
            >
              <Button type="submit">Sign out</Button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-200 text-black rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-fit gap-2 p-2 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-500 shadow-blocks-sm font-main">
            <p>
              In order to save your page and register for a passport ceremony,{" "}
              <span className="font-bold">please sign in.</span>
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("discord");
              }}
              className="mx-auto"
            >
              <Button
                className="bg-discord-light hover:bg-discord-vibrant"
                type="submit"
              >
                Sign in with Discord
              </Button>
            </form>
          </div>
        )}
      </div>
      <Playground />
    </main>
  );
}
