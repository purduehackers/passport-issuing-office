import { auth } from "@/auth";
import { NewPassportView } from "@/components/not-activated-view";
import UserInfo from "@/components/user-info";
import { MySession } from "@/types/types";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const generateNew = searchParams["new"];

  // Although the session includes the JWT token type from `auth.ts`, when it gets here
  // next-auth still thinks it doesn't exist, even though it does when I log it.
  // As a temporary workaround, I've created my own Session type which contains
  // what I'm actually getting from next-auth.
  let session = (await auth()) as MySession | null;
  const userId = session?.token.sub;
  const latestPassport = session?.passport;

  // This is temporary. In the future, we can render the preview as a DOM element directly,
  // since we have access to all the data.
  let latestPassportImageUrl: string | null = null;
  if (latestPassport) {
    latestPassportImageUrl = `${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`;
  }

  if (latestPassport?.activated && generateNew !== "true") {
    redirect("/activated");
  }

  return (
    <main className="bg-slate-900 flex flex-col min-h-screen">
      <UserInfo user={session?.user} />
      <div className="flex flex-col items-center gap-y-12 sm:gap-y-24 p-4 sm:p-24">
        <NewPassportView
          userId={userId}
          session={session}
          latestPassport={latestPassport}
          latestPassportImageUrl={latestPassportImageUrl}
        />
      </div>
    </main>
  );
}
