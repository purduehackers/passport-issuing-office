"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LaunchConfetti from "@/lib/confetti";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { processImage } from "@/lib/process-image";
import { Crop } from "./crop";
import { useState } from "react";
import { ImageResponse } from "next/og";
import Image from "next/image";
import { createPassport, uploadImageToR2 } from "@/lib/actions";
import {
	GenerationStatus,
	GenerationStep,
	GenerationStepId,
	OptimizedLatestPassportImage,
	Passport,
} from "@/types/types";
import { formatDefaultDate } from "@/lib/format-default-date";
import { GENERATION_STEPS } from "@/config";
import { CheckCircle } from "lucide-react";
import { ImageActions } from "./image-actions";
import defaultImage from "@/public/passport/default.png";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	getCeremonyTimestamp,
	getCeremonyTimeString,
} from "@/lib/ceremony-data";
import CeremonyDropdown from "@/lib/ceremony-dropdown"

const ORIGINS = ["The woods", "The deep sea", "The tundra"];

const maxDate = new Date();
const nullDate = new Date(-1);

const FormSchema = z.object({
	surname: z
		.string()
		.min(1, {
			message: "Name must be at least 1 character.",
		})
		.trim(),
	firstName: z
		.string()
		.min(1, {
			message: "Name must be at least 1 character.",
		})
		.trim(),
	placeOfOrigin: z.string().max(13),
	dateOfBirth: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: "Invalid date format. Please enter a valid date.",
		})
		.refine(
			(val) => {
				const inputDate = new Date(val);
				return inputDate < maxDate;
			},
			{
				message: "Date of birth cannot be later than today.",
			},
		),
	ceremonyTime: z
		.string() // Don't refine. Causes issues.
		.optional(),
	image: z.custom<File>((val) => val instanceof File, "Please upload a file"),
	passportNumber: z.string().max(4).optional(),
	sendToDb: z.string().default("false"),
});

export default function Playground({
	userId,
	latestPassport,
	latestOverallPassportId,
	optimizedLatestPassportImage,
	guildMember,
}: {
	userId: string | undefined;
	latestPassport: Passport | null | undefined;
	latestOverallPassportId: number;
	optimizedLatestPassportImage: OptimizedLatestPassportImage | null;
	guildMember: object | null | undefined;
}) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			firstName: latestPassport?.name || "",
			surname: latestPassport?.surname || "",
			dateOfBirth: latestPassport
				? formatDefaultDate(latestPassport.date_of_birth)
				: undefined,
			placeOfOrigin: latestPassport?.place_of_origin || ORIGINS[0],
			ceremonyTime: latestPassport
				? formatDefaultDate(latestPassport.ceremony_time)
				: undefined,
			image: undefined,
			passportNumber: "0",
		},
	});

	const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(
		optimizedLatestPassportImage?.latestPassportImageUrl ||
		"/passport/default.png",
	);
	const [isDefaultImage, setIsDefaultImage] = useState(
		generatedImageUrl === "/passport/default.png" ? true : false,
	);
	const [isLoading, setIsLoading] = useState(false); // TODO: do this better
	const [launchConfetti, setLaunchConfetti] = useState(false); // TODO: do this better
	const [croppedImageFile, setCroppedImageFile] = useState<File>();
	const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(
		GENERATION_STEPS.base,
	);
	const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony");

	function updateGenerationStepState(
		stepId: GenerationStepId,
		status: GenerationStatus,
	) {
		setGenerationSteps((currentSteps) =>
			currentSteps.map((step) =>
				step.id === stepId ? { ...step, status } : step,
			),
		);
	}

	function resetGenerationSteps() {
		setGenerationSteps((currentSteps) =>
			currentSteps.map((step) => {
				return { ...step, status: "pending" };
			}),
		);
	}

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		if (data.ceremonyTime == "9999-99-99T00:00:00.000Z") {
			data.sendToDb = "false"
		}

		setIsLoading(true);
		setLaunchConfetti(false);

		let generatedPassportNumber = data.passportNumber || "0";

		if (!croppedImageFile) {
			return; // TODO: handle error
		}
		const imageData = await processImage(croppedImageFile);
		updateGenerationStepState("processing_portrait", "completed");

		const apiFormData = new FormData();
		for (const [key, val] of Object.entries(data)) {
			if (key !== "image") {
				apiFormData.append(key, String(val));
			}
		}
		apiFormData.append("portrait", imageData);
		if (userId) {
			apiFormData.append("userId", userId);
		}

		if (data.sendToDb == "true") {
			const { passportNumber } = await createPassport(apiFormData);
			generatedPassportNumber = String(passportNumber);
			apiFormData.set("passportNumber", String(passportNumber));

			updateGenerationStepState("assigning_passport_number", "completed");
		}

		const postRes: ImageResponse = await fetch(`/api/generate-data-page`, {
			method: "POST",
			body: apiFormData,
		});
		const generatedImageBlob = await postRes.blob();
		const generatedImageFile = new File([generatedImageBlob], "data_page.png", {
			type: "image/png",
		});
		updateGenerationStepState("generating_data_page", "completed");

		if (data.sendToDb == "true") {
			const generateFullFrameReq = await fetch(`/api/generate-full-frame`, {
				method: "POST",
				body: apiFormData,
			});
			if (generateFullFrameReq.status !== 200) {
				alert(
					"Wtf for some reason your full data page failed to upload. Try again? If this issue persists DM Matthew",
				);
				setIsLoading(false);
				resetGenerationSteps();
				return;
			}
			updateGenerationStepState("generating_frame", "completed");

			apiFormData.append("generatedImage", generatedImageFile);
			if (process.env.PRODUCTION) {
				try {
					await uploadImageToR2(
						"generated",
						apiFormData,
						generatedPassportNumber,
					);
				} catch (error) {
					alert(
						"Wtf for some reason your data page failed to upload. Try again? If this issue persists DM Matthew",
					);
					setIsLoading(false);
					resetGenerationSteps();
					return;
				}
			}

			updateGenerationStepState("uploading", "completed");
		}

		const generatedImageBuffer = Buffer.from(
			await generatedImageBlob.arrayBuffer(),
		);
		const generatedImageUrl =
			"data:image/png;base64," + generatedImageBuffer.toString("base64");
		updateGenerationStepState("summoning_elves", "completed");

		setGeneratedImageUrl(generatedImageUrl);
		setIsLoading(false);
		setIsDefaultImage(false);
		resetGenerationSteps();
		setLaunchConfetti(true);
	}

	return (
		<main className="grid lg:grid-cols-[2fr_3fr] gap-20 lg:gap-12 w-full max-w-4xl">
			<Form {...form}>
				<form
					id="passportform"
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col gap-y-6"
				>
					<p>1. Register</p>

					{userId && guildMember !== undefined ? (
						<span>
							<FormField
								control={form.control}
								name="sendToDb"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel>Register this passport</FormLabel>
										<FormDescription>
											Register for an upcoming passport ceremony? SOME OTHER
											TEXT HERE (NTS: Ask Matthew Later -Michael)
										</FormDescription>
										<FormControl>
											<RadioGroup
												onValueChange={(e) => {
													field.onChange(e);
													{
														if (e == "false") {
															setGenerationSteps(GENERATION_STEPS.base);
														} else {
															setGenerationSteps(GENERATION_STEPS.register);
														}
													}
												}}
												defaultValue={field.value}
												className="flex flex-col space-y-1"
											>
												<FormItem className="flex space-x-1 space-y-0">
													<span className="flex space-x-1 space-y-0">
														<FormControl>
															<RadioGroupItem value="true" />
														</FormControl>
														<FormLabel className="font-normal">Yes</FormLabel>
													</span>
												</FormItem>
												<FormItem className="flex space-x-1 space-y-0">
													<span className="flex space-x-1 space-y-0">
														<FormControl>
															<RadioGroupItem value="false" />
														</FormControl>
														<FormLabel className="font-normal">No</FormLabel>
													</span>
												</FormItem>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{form.getValues("sendToDb") == "true" ? (
								<span>
									<br />
									<FormField
										control={form.control}
										name="ceremonyTime"
										render={({ field }) => (
											<span>
												<FormItem>
													<FormLabel>Ceremony Date</FormLabel>
													<FormControl>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="outline"
																	className="w-full"
																>
																	{ceremonyTime == "noPassportCeremony" ? (
																		<p>Select a Date</p>
																	) : (
																		<p>
																			{getCeremonyTimeString(ceremonyTime)}
																		</p>
																	)}
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent className="w-full min-w-0">
																<DropdownMenuLabel>
																	Upcoming Ceremonies
																</DropdownMenuLabel>
																<DropdownMenuSeparator />
																<DropdownMenuRadioGroup
																	value={field.value}
																	onValueChange={(e) => {
																		field.onChange(getCeremonyTimestamp(e));
																		setCeremonyTime(e);
																	}}
																>
																	<DropdownMenuRadioItem
																		value="noPassportCeremony"
																		className="flex justify-between items-center"
																	>
																		Select a Date
																	</DropdownMenuRadioItem>
																	<CeremonyDropdown />
																</DropdownMenuRadioGroup>
															</DropdownMenuContent>
														</DropdownMenu>
													</FormControl>
													<FormMessage />
												</FormItem>
												<br />
											</span>
										)}
									/>
								</span>
							) : (
								<FormField
									control={form.control}
									name="ceremonyTime"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													type="hidden"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</span>
					) : (
						<span>
							{!userId ? (
								<FormField
									control={form.control}
									name="ceremonyTime"
									render={({ field }) => (
										<FormItem>
											<span className="rounded-sm border-[3px] border-amber-400 flex flex-col justify-center w-full md:w-10/12 gap-2 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-amber-600 shadow-blocks-sm font-main">
												<p>
													To register for an upcoming ceremony, please join our
													Discord, then refresh this page.
												</p>
											</span>
											<FormControl>
												<Input
													type="hidden"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : (
								<></>
							)}
							<FormField
								control={form.control}
								name="ceremonyTime"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												type="hidden"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</span>
					)}

					<p>2. Generate</p>
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First name</FormLabel>
								<FormControl>
									<Input
										placeholder="Wack"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="surname"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last name</FormLabel>
								<FormControl>
									<Input
										placeholder="Hacker"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="placeOfOrigin"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Place of origin</FormLabel>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										{ORIGINS.map((origin) => (
											<FormItem
												key={origin}
												className="flex-row items-center gap-x-2"
											>
												<FormControl>
													<RadioGroupItem value={origin} />
												</FormControl>
												<FormLabel className="font-normal">{origin}</FormLabel>
											</FormItem>
										))}
										<FormItem className="flex-row items-center gap-x-2">
											<FormControl>
												<RadioGroupItem value="" />
											</FormControl>
											<FormLabel className="font-normal">
												Write your own…
											</FormLabel>
										</FormItem>
										{!ORIGINS.includes(form.getValues().placeOfOrigin) && (
											<div className="pl-6">
												<Input
													{...field}
													className="h-8"
													autoFocus
												/>
											</div>
										)}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="dateOfBirth"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Date of birth</FormLabel>
								<FormControl>
									<Input
										type="date"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="image"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Portrait</FormLabel>
								<FormControl>
									<Crop
										field={field}
										croppedImageFile={croppedImageFile}
										setCroppedImageFile={setCroppedImageFile}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{form.getValues("sendToDb") == "true" ? (
						<Dialog>
							<DialogTrigger
								className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
								disabled={isLoading}
							>
								{isLoading ? "Generating..." : "Generate"}
							</DialogTrigger>
							<DialogContent className="w-11/12 sm:w-auto max-h-screen h-128 overflow-y-auto">
								<DialogHeader>
									<DialogTitle className="text-2xl">
										Passport Ceremony Registration
									</DialogTitle>
								</DialogHeader>
								<DialogDescription className="flex flex-col gap-2 leading-relaxed text-base">
									<p>PLACEHOLDER TEXT HERE</p>
									<p>PLEASE MAKE SURE YOU CAN MAKE IT TO THE CEREMONY</p>
									<p>IF SOMETHING COMES UP TELL MATTHEW</p>
									<DialogClose asChild>
										<Button
											type="submit"
											form="passportform"
											className="amberButton"
											disabled={isLoading}
										>
											{"Register My Passport"}
										</Button>
									</DialogClose>
								</DialogDescription>
							</DialogContent>
						</Dialog>
					) : (
						<Button
							className="amberButton"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? "Generating..." : "Generate"}
						</Button>
					)}
				</form>
			</Form>
			<aside>
				<div className="flex flex-col gap-4">
					{generatedImageUrl ===
						optimizedLatestPassportImage?.latestPassportImageUrl ? (
						<Image
							src={optimizedLatestPassportImage.latestPassportImageUrl}
							alt="Passport preview"
							width={optimizedLatestPassportImage.metadata.width}
							height={optimizedLatestPassportImage.metadata.height}
							placeholder="blur"
							blurDataURL={optimizedLatestPassportImage.base64}
							style={{
								borderRadius: "8px",
							}}
						/>
					) : generatedImageUrl === "/passport/default.png" ? (
						<Image
							src={defaultImage}
							alt="Preview of default passport page"
							width={708}
							height={483}
							placeholder="blur"
							style={{
								borderRadius: "8px",
							}}
						/>
					) : (
						<img
							src={generatedImageUrl}
							alt="Preview of passport page"
							className="rounded-lg w-full"
						/>
					)}

					{isLoading ? (
						<ul>
							{generationSteps.map((step, index) => (
								<div
									key={index}
									className="flex flex-row items-center gap-1"
								>
									<li
										className={`${step.status === "completed"
												? "text-success"
												: step.status === "failed"
													? "text-destructive"
													: "text-muted-foreground"
											}`}
									>
										{step.name}...
									</li>
									{step.status === "completed" ? (
										<CheckCircle
											color="var(--success)"
											width={16}
										/>
									) : null}
								</div>
							))}
						</ul>
					) : null}
					{!isDefaultImage && !isLoading ? (
						<ImageActions
							generatedImageUrl={generatedImageUrl}
							userId={userId}
							latestPassport={latestPassport}
							firstName={form.getValues().firstName}
							surname={form.getValues().surname}
							sendToDb={form.getValues().sendToDb == "true"}
						/>
					) : null}
					{
						!isDefaultImage &&
							!isLoading &&
							!latestPassport &&
							!(form.getValues().sendToDb == "true") ? (
							<div className="rounded-sm border-[3px] border-amber-400 flex flex-col justify-center w-full md:w-10/12 gap-2 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-amber-600 shadow-blocks-sm font-main">
								<p>
									Nice Passport! Want to make it real? Register for an upcoming
									passport ceremony at step 1.
								</p>
							</div>
						) : null}
					{launchConfetti ? <LaunchConfetti /> : null}
				</div>
			</aside>
		</main>
	);
}
