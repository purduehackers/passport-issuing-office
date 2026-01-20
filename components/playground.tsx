"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LaunchConfetti from "@/lib/confetti";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageResponse } from "next/og";
import Image from "next/image";
import { createPassport, getPreSignedUrl } from "@/lib/actions";
import { uploadToPresignedUrl } from "@/lib/upload-to-presigned-url";
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
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	getCeremonyTimestamp,
	getCeremonyTimeString,
	getCeremonyTimeStringDate,
	getCeremonyTimeStringTime,
} from "@/lib/ceremony-data";
import CeremonyDropdown from "@/lib/ceremony-dropdown";
import { Switch } from "./ui/switch";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { SecretModalDescription } from "./secret-modal-description";
import { StepLabel } from "./step-label";

const ORIGINS = ["The woods", "The deep sea", "The tundra"];

const maxDate = new Date();

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
});

export default function Playground({
	userId,
	latestPassport,
	optimizedLatestPassportImage,
	guildMember,
}: {
	userId: string | undefined;
	latestPassport: Passport | null | undefined;
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
			ceremonyTime: undefined,
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
	const [openDialog, setOpenDialog] = useState(false);
	const [errors, setErrors] = useState<any>(null);
	const [secretOptionsEnabled, setSecretOptionsEnabled] = useState(false);
	const [secretSignatureSigned, setSecretSignatureSigned] = useState(false);

	const hasSubmittedRef = useRef(false);

	const formValues = form.watch();
	useEffect(() => {
		hasSubmittedRef.current = false;
	}, [formValues]);

	const ceremonyTimeFormValue = formValues.ceremonyTime;
	const sendToDb = useMemo(() => {
		return (
			typeof ceremonyTimeFormValue !== "undefined" &&
			ceremonyTimeFormValue !== "" &&
			ceremonyTimeFormValue !== "noPassportCeremony"
		);
	}, [ceremonyTimeFormValue]);

	useKonamiCode(() => {
		setSecretOptionsEnabled(true);
		alert("Secret options enabled 👀✨"); // TODO: do this more elegantly
	});

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

	function validateForm(formValues: {
		firstName: string;
		surname: string;
		placeOfOrigin: string;
		dateOfBirth: string;
		image: File;
		ceremonyTime?: string | undefined;
		passportNumber?: string | undefined;
	}) {
		const formData = {
			surname: formValues.surname,
			firstName: formValues.firstName,
			placeOfOrigin: formValues.placeOfOrigin,
			dateOfBirth: formValues.dateOfBirth,
			ceremonyTime: formValues.ceremonyTime,
			image: formValues.image,
			passportNumber: formValues.passportNumber,
		};

		const validationResult = FormSchema.safeParse(formData);

		if (!validationResult.success) {
			setErrors(validationResult.error.format());
			return false;
		}

		setErrors(null);
		//openConfirmationDialog();
		return true;
	}

	function renderError(field: string) {
		return (
			errors?.[field] && (
				<FormMessage>{errors[field]._errors.join(", ")}</FormMessage>
			)
		);
	}

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setIsLoading(true);
		setLaunchConfetti(false);
		setOpenDialog(false);
		setSecretSignatureSigned(false);

		let generatedPassportNumber = data.passportNumber || "0";

		if (!croppedImageFile) {
			return; // TODO: handle error
		}
		const imageData = await processImage(croppedImageFile);
		updateGenerationStepState("processing_portrait", "completed");

		const apiFormData = new FormData();
		for (const [key, val] of Object.entries(data)) {
			if (key !== "image") {
				if (key === "ceremonyTime" && val === "skipPassportCeremony") {
					const noCeremonyVal = new Date(
						"1970-01-01T00:00:00.000Z",
					).toISOString();
					apiFormData.append(key, noCeremonyVal);
					continue;
				}
				apiFormData.append(key, String(val));
			}
		}
		apiFormData.append("portrait", croppedImageFile);
		apiFormData.append("datapage", imageData);
		if (userId) {
			apiFormData.append("userId", userId);
		}
		apiFormData.append("sendToDb", sendToDb.toString());

		if (sendToDb) {
			const { passportNumber } = await createPassport(apiFormData);
			generatedPassportNumber = String(passportNumber);
			apiFormData.set("passportNumber", String(passportNumber));

			updateGenerationStepState("assigning_passport_number", "completed");
		}

		let postRes: ImageResponse;
		try {
			postRes = await fetch(`/api/generate-data-page`, {
				method: "POST",
				body: apiFormData,
			});
			if (!postRes.ok) {
				throw new Error(`Data page form upload failed`);
			}
		} catch (error) {
			alert(
				"An error occurred while uploading the form data. Try again? If this issue persists, please ask on our Discord for help!",
			);
			console.log(error);
			setIsLoading(false);
			resetGenerationSteps();
			return;
		}

		const generatedImageBlob = await postRes.blob();
		const generatedImageFile = new File([generatedImageBlob], "data_page.png", {
			type: "image/png",
		});
		updateGenerationStepState("generating_data_page", "completed");

		if (sendToDb) {
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

			try {
				const presignedUrl = await getPreSignedUrl(
					"generated",
					generatedPassportNumber,
				);
				await uploadToPresignedUrl(presignedUrl, generatedImageFile);
			} catch (error) {
				alert(
					"Wtf for some reason your data page failed to upload. Try again? If this issue persists DM Matthew",
				);
				console.log(error);
				setIsLoading(false);
				resetGenerationSteps();
				return;
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

		hasSubmittedRef.current = true;
	}

	return (
		<main className="grid lg:grid-cols-[2fr_3fr] gap-20 lg:gap-12 w-full max-w-4xl">
			<Form {...form}>
				<form
					id="passportform"
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col gap-y-6"
				>
					{userId ? (
						<StepLabel
							stepNumber="1"
							stepName="Generate"
						/>
					) : (
						<></>
					)}
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
								{renderError("firstName")}
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
								{renderError("surname")}
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
								{renderError("placeOfOrigin")}
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
								{renderError("dateOfBirth")}
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
								{renderError("image")}
							</FormItem>
						)}
					/>

					{userId ? (
						<StepLabel
							stepNumber="2"
							stepName="Register"
							className="-mb-4"
						/>
					) : (
						<></>
					)}

					{userId && guildMember !== undefined ? (
						<span>
							<div className="flex flex-col gap-2 mb-6">
								<p className="text-sm text-muted-foreground">
									Register for an hour-long passport ceremony to turn your data
									page into a real-life passport! :D
								</p>
								<p className="text-sm text-muted-foreground">
									If you want to sign up for a passport-making ceremony, you{" "}
									<span className="italic">must</span> select an available time
									below. If you don’t select a time, your passport won’t be
									registered!
								</p>
								<p className="text-sm text-muted-foreground">
									If you just want to play around without registering, that’s ok
									too :) Also you can replace your data page anytime—just make
									sure to re-register every time you want to send a new data
									page over.
								</p>
							</div>
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
															<p>
																{getCeremonyTimeString(
																	ceremonyTime,
																	secretOptionsEnabled,
																)}
															</p>
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
																{
																	if (e == "noPassportCeremony") {
																		setGenerationSteps(GENERATION_STEPS.base);
																	} else {
																		setGenerationSteps(
																			GENERATION_STEPS.register,
																		);
																	}
																}
															}}
														>
															<DropdownMenuRadioItem
																value="noPassportCeremony"
																className="flex justify-between items-center"
															>
																Select a Date
															</DropdownMenuRadioItem>
															<CeremonyDropdown
																secretOptionsEnabled={secretOptionsEnabled}
															/>
														</DropdownMenuRadioGroup>
													</DropdownMenuContent>
												</DropdownMenu>
											</FormControl>
											<FormMessage />
											{renderError("ceremonyTime")}
										</FormItem>
									</span>
								)}
							/>
						</span>
					) : (
						<span>
							{userId && guildMember == undefined ? (
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
											{renderError("ceremonyTime")}
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
										{renderError("ceremonyTime")}
									</FormItem>
								)}
							/>
						</span>
					)}

					{sendToDb ? (
						<>
							<Button
								className="amberButton"
								disabled={isLoading}
								onClick={(e) => {
									e.preventDefault();
									if (validateForm(form.getValues())) {
										setOpenDialog(true);
									}
								}}
							>
								{isLoading ? "Generating..." : "Generate"}
							</Button>
							<Dialog
								open={openDialog}
								onOpenChange={(open) => {
									setOpenDialog(open);
									if (!open) {
										setSecretSignatureSigned(false);
									}
								}}
							>
								<DialogContent className="w-11/12 sm:w-auto overflow-y-auto">
									<DialogHeader>
										<DialogTitle className="text-2xl">
											Passport Ceremony Registration
										</DialogTitle>
									</DialogHeader>
									<DialogDescription className="flex flex-col gap-2 leading-relaxed text-base">
										{form.getValues("ceremonyTime") ===
										"skipPassportCeremony" ? (
											<SecretModalDescription
												setSecretSignatureSigned={setSecretSignatureSigned}
											/>
										) : (
											<>
												<p>
													By clicking &quot;Register My Passport&quot;,
													you&apos;re signing up to make your own passport at
													Hack Night on{" "}
													{getCeremonyTimeStringDate(ceremonyTime)} at{" "}
													{getCeremonyTimeStringTime(ceremonyTime)}. Please show
													up on time so that you have enough time to make your
													passport. If you&apos;re late, we will start without
													you & you will need to re-register for the next one.
												</p>

												<p>
													This ceremony will last one hour. Please make sure you
													are able to stay for the full hour!
												</p>

												<p>
													We spend real money and human labor on each passport,
													so please make sure you&apos;re there! If plans change
													& you can&apos;t make it, please post in #lounge or DM
													Matthew (@hewillyeah) and let us know so that we
													don&apos;t prep the materials for your passport.
												</p>
											</>
										)}
										<br />
										<Button
											type="submit"
											form="passportform"
											className="amberButton"
											disabled={
												isLoading ||
												(secretOptionsEnabled && !secretSignatureSigned)
											}
										>
											{"Register My Passport"}
										</Button>
									</DialogDescription>
								</DialogContent>
							</Dialog>
						</>
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
										className={`${
											step.status === "completed"
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
							sendToDb={sendToDb}
						/>
					) : null}
					{!isDefaultImage &&
					!isLoading &&
					userId &&
					!sendToDb &&
					hasSubmittedRef.current ? (
						<div className="rounded-sm border-[3px] border-amber-400 flex flex-col justify-center w-full md:w-10/12 gap-2 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-amber-600 shadow-blocks-sm font-main">
							<p>
								Nice Passport! Want to make it real? Select the next available
								passport ceremony time at the “Register” step!
							</p>
						</div>
					) : null}
					{launchConfetti ? <LaunchConfetti /> : null}
				</div>
			</aside>
		</main>
	);
}
