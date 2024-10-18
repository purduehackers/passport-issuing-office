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
import { getOptimizedLatestPassportImage } from "@/lib/get-optimized-latest-passport-image";

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
			title: "Passport Issuing Office",
			description:
				"Register to make your Republic of Hackerland passport, & create your data page 🛂",
		};
	}

	const r2PassportUrl = `${process.env.R2_PUBLIC_URL}/${latestPassport.id}.png`;

	return {
		metadataBase: new URL("https://passports.purduehackers.com"),
		title: `Make your Purdue Hackers passport with ${latestPassport.name}`,
		description:
			"NFC-enabled passports that level you up. Generate yours here, then assemble it at Hack Night.",
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

	const { latestPassportImageUrl, base64, metadata } =
		await getOptimizedLatestPassportImage(latestPassport.id);

	return (
		// <div className="min-h-screen flex flex-col mt-24 sm:mt-0 sm:justify-center items-center bg-[url('/passport/bg-inverted-dark.png')]">
		<div className="min-h-screen flex flex-col pt-24 sm:pt-0 sm:justify-center items-center">
			<div className="w-11/12 md:w-auto flex flex-col gap-4">
				<Image
					alt={`Passport for discord id ${latestPassport.id}`}
					src={latestPassportImageUrl}
					placeholder="blur"
					blurDataURL={base64}
					width={metadata.width / 2}
					height={metadata.height / 2}
					style={{
						borderRadius: "8px",
					}}
				/>
				<div className="grid grid-cols-2 sm:grid-cols-3">
					<div className="hidden sm:block" />
					<PreviewPageLink>
						<Button
							type="button"
							className="w-full mx-auto font-bold amberButton"
						>
							{session ? "View yours" : "Make your own"}
						</Button>
					</PreviewPageLink>
					<Dialog>
						<DialogTrigger className="w-fit ml-auto cursor-pointer text-muted-foreground flex justify-center items-center gap-1">
							<Info size={16} />
							<p>What&#39;s this?</p>
						</DialogTrigger>
						<DialogContent className="w-11/12 sm:w-auto max-h-screen h-128 overflow-y-auto">
							<DialogHeader>
								<DialogTitle className="text-2xl">
									What are passports?
								</DialogTitle>
							</DialogHeader>
							<DialogDescription className="flex flex-col gap-2 leading-relaxed text-base">
								<div>
									<img
										src="/cover.svg"
										width={64}
										alt="Purdue Hackers passport cover"
										className="float-left mr-4"
									/>
									<p>
										Purdue Hackers spent three months meticulously crafting
										high-quality passports for its citizens. Every page is a
										reference to some defining part of Purdue Hackers, and they
										can get stamped at every Hack Night. Passports are handmade
										by their owners at passport-making ceremonies during Hack
										Night.
									</p>
								</div>
								<p>
									Every passport has an NFC sticker embedded in its cover,
									allowing you to scan your passport as you would scan your
									Purdue ID, or with your phone. This enables you to use your
									passport to gain access to many Purdue Hackers services,
									including exclusive software and access to Hack Night without
									ringing the doorbell.
								</p>
								<p>
									Purdue Hackers believes strongly that your time in college
									should be magical and unforgettable. In addition to unlocking
									exclusive perks, your passport will serve as a physical,
									everlasting reminder of your time in Purdue Hackers. The
									portrait image you set, the stamps you earn at Hack Night, and
									the images referencing the best of Purdue Hackers will be with
									you long after you graduate. All software will also be
									available to you forever.
								</p>
								<p>
									While you do level up with a passport, you do not and will
									never need a passport in order to be a &ldquo;real&rdquo;
									member of Purdue Hackers. Especially now, passports still
									don&#39;t have much use because we&#39;re still building all
									the software that will eventually make them useful. Today,
									getting a passport means being an early adopter.
								</p>
								<p>
									If you resonate with this and think the passports are cool,
									the door is open for you to make one. Click the button below
									to get started.
								</p>
								<PreviewPageLink className="mx-auto mt-2">
									<Button
										type="button"
										className="amberButton"
									>
										Make your passport
									</Button>
								</PreviewPageLink>
							</DialogDescription>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
