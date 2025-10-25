import { auth } from "@/auth";
import IndividualPassportAdmin from "@/components/admin/passport";
import UserInfo from "@/components/user-info";
import { getLatestPassport } from "@/lib/get-latest-passport";
import type { MySession } from "@/types/types";
import { notFound, redirect } from "next/navigation";

type Params = Promise<{
	id: string;
}>;

interface Props {
	params: Params;
}

export default async function IndividualPassportAdminPage({ params }: Props) {
	const { id } = await params;

	const latestPassport = await getLatestPassport(id);
	if (!latestPassport) {
		notFound();
	}

	// Although the session includes the JWT token type from `auth.ts`, when it gets here
	// next-auth still thinks it doesn't exist, even though it does when I log it.
	// As a temporary workaround, I've created my own Session type which contains
	// what I'm actually getting from next-auth.
	const session = (await auth()) as MySession | null;

	if (session?.role !== "admin") {
		redirect("/");
	}

	if (session?.role === "admin") {
		return (
			<main className="bg-background flex flex-col min-h-screen">
				<UserInfo
					user={session?.user}
					role={session?.role}
				/>
				<div className="flex flex-col items-center pb-4 px-4 pt-0 sm:px-24 sm:pt-4 sm:pb-24">
					<div className="rounded-sm flex flex-col justify-center p-2 sm:p-4 my-4 w-full md:w-9/12 mx-auto break-inside-avoid font-main">
						<h1 className="font-bold text-3xl text-amber-400 sm:text-5xl lg:text-[5rem] text-center mx-auto mb-4 flex flex-col justify-center items-center gap-2 sm:gap-4">
							<img
								alt="passport cover"
								src="/cover.svg"
								className="self-center flex-shrink-0 h-20 sm:h-[2em] w-auto pointer-events-none"
							/>
							<p>Passport Information</p>
						</h1>
						{!process.env.PRODUCTION ? (
							<div className="rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-10/12 gap-4 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-600 shadow-blocks-sm font-main">
								<p>
									This is a staging instance of the Passport page. Please do not
									use this page to modify live data.
								</p>
							</div>
						) : null}
					</div>
					<IndividualPassportAdmin id={id} />
				</div>
			</main>
		);
	}

	return (
		<main>
			<div>Unauthorized.</div>
		</main>
	);
}
