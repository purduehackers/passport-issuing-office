import { auth } from "@/auth";
import { SignInButton, JoinGuildButton } from "@/components/auth-buttons";
import Playground from "@/components/playground";
import UserInfo from "@/components/user-info";
import { getLatestOverallPassportId } from "@/lib/get-latest-passport";
import { getOptimizedLatestPassportImage } from "@/lib/get-optimized-latest-passport-image";
import { MySession, OptimizedLatestPassportImage } from "@/types/types";
import { redirect } from "next/navigation";

export default async function Home({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const generateNew = searchParams["new"];

	// This is a temporary method of limiting passports for a ceremony. I'm planning
	// to redo how passport ceremony registration works, but for now we just need to
	// limit this week's signups.
	const latestOverallPassportId = await getLatestOverallPassportId();

	// Although the session includes the JWT token type from `auth.ts`, when it gets here
	// next-auth still thinks it doesn't exist, even though it does when I log it.
	// As a temporary workaround, I've created my own Session type which contains
	// what I'm actually getting from next-auth.
	let session = (await auth()) as MySession | null;
	const userId = session?.token?.sub;
	const latestPassport = session?.passport;
	const guildMember = session?.guildMember;

	let optimizedLatestPassportImage: OptimizedLatestPassportImage | null = null;
	if (latestPassport) {
		optimizedLatestPassportImage = await getOptimizedLatestPassportImage(
			latestPassport.id,
		);
	}

	if (latestPassport?.activated && generateNew !== "true") {
		redirect("/activated");
	}

	return (
		<main className="bg-background flex flex-col min-h-screen">
			<UserInfo
				user={session?.user}
				role={session?.role}
			/>
			<div className="flex flex-col items-center gap-y-12 sm:gap-y-20 pb-4 px-4 pt-0 sm:px-24 sm:pt-4 sm:pb-24">
				<div className="rounded-sm flex flex-col justify-center p-2 sm:p-4 my-4 w-full md:w-9/12 mx-auto break-inside-avoid font-main">
					<h1 className="font-bold text-3xl text-amber-400 sm:text-5xl lg:text-[5rem] text-center mx-auto mb-4 flex flex-col justify-center items-center gap-2 sm:gap-4">
						<img
							alt="passport cover"
							src="/cover.svg"
							className="self-center flex-shrink-0 h-20 sm:h-[2em] w-auto pointer-events-none"
						/>
						Passport Data Pages
					</h1>
					<div className="rounded-sm border-[3px] border-amber-400 flex flex-col justify-center w-full md:w-10/12 gap-2 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-amber-600 shadow-blocks-sm font-main">
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
								the checkbox to be assigned a passport number. Your passport
								will be printed & ready to assemble at the next ceremony.
							</p>
						) : null}
					</div>
					{!session?.user?.email ? (
						<div className="rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-10/12 gap-4 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-600 shadow-blocks-sm font-main">
							<p>
								You are currently in Playground Mode: you can play with a data
								page & it will not be shared with us. To save your page and
								register for a passport ceremony, you&#39;ll need to sign in.
							</p>
							<SignInButton dark />
						</div>
					) : null}
					{!process.env.PRODUCTION ? (
						<div className="rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-10/12 gap-4 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-600 shadow-blocks-sm font-main">
							<p>
								This is a staging instance of the Passport Data Page generator.
								If you would like to attend a passport ceremony, use the live
								page.
							</p>
						</div>
					) : null}
				</div>
				<Playground
					userId={userId}
					latestPassport={latestPassport}
					latestOverallPassportId={latestOverallPassportId}
					optimizedLatestPassportImage={optimizedLatestPassportImage}
					guildMember={guildMember}
				/>
			</div>
		</main>
	);
}
