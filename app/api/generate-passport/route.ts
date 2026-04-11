import { generateDataPage, generateFullFrame } from "@/lib/generate-data-page";
import {
	generatePreSignedUrl,
	r2rename,
	serverR2Download,
	serverR2Upload,
} from "@/lib/r2";
import { GeneratePassportSchema } from "@/types/types";
import { captureException } from "@sentry/nextjs";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const parsed = await Sentry.startSpan(
		{ name: "Validate POST body", op: "parse" },
		async () => GeneratePassportSchema.safeParse(await request.json()),
	);
	if (!parsed.success) {
		Sentry.logger.warn("Invalid body", { error: parsed.error.format() });
		return Response.json(
			{
				ok: false,
				error: "Invalid request body",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const {
		surname,
		firstName,
		placeOfOrigin,
		dateOfBirth,
		dateOfIssue,
		ceremonyTime,
		passportNumber,
		portraitKey,
		stylizedPortraitKey,
		sendToDb,
	} = parsed.data;

	for (const key of [portraitKey, stylizedPortraitKey]) {
		// Return 403 forbidden if the client tries to use an image other than a temporary one.
		// We assume any temporary one belongs to the requesting user because the chance of them correctly
		// guessing a random UUID is negligible.
		if (!key.startsWith("temp/")) {
			Sentry.logger.warn("Non-temporary image object key", { key });
			return Response.json(
				{
					ok: false,
					error: "Invalid object image key. Only temporary images can be used.",
					details: { key },
				},
				{ status: 403 },
			);
		}
	}

	Sentry.setExtras({
		passportNumber,
		portraitKey,
		stylizedPortraitKey,
		sendToDb,
	});

	const genData = {
		passportNumber,
		surname,
		firstName,
		dateOfBirth,
		dateOfIssue,
		ceremonyTime,
		placeOfOrigin,
		stylizedPortraitUrl: `${process.env.R2_PUBLIC_URL}/${stylizedPortraitKey}`,
		sendToDb,
	};

	const dataPageFile = await Sentry.startSpan(
		{ name: "Generate passport", op: "function" },
		() => generateDataPage(genData, request.url),
	);
	let dataPageKey = `temp/${crypto.randomUUID()}.png`;
	const response = await Sentry.startSpan(
		{ name: "Upload data page to R2", op: "r2.upload" },
		async () => {
			try {
				await serverR2Upload(dataPageKey, dataPageFile);
			} catch (error) {
				captureException(error);
				return Response.json(
					{ ok: false, error: "Failed to upload generated image to R2" },
					{ status: 500 },
				);
			}
		},
	);
	if (response) return response;

	if (sendToDb) {
		const fullFrameFile = await Sentry.startSpan(
			{ name: "Generate full frame", op: "function" },
			() => generateFullFrame(dataPageFile),
		);

		if (process.env.PRODUCTION) {
			try {
				await Sentry.startSpan(
					{
						name: "Save generated passport",
						op: "function",
					},
					() =>
						Promise.all([
							Sentry.startSpan(
								{ name: "Upload full frame to R2", op: "r2.upload" },
								() =>
									serverR2Upload(`${passportNumber}-full.png`, fullFrameFile),
							),
							Sentry.startSpan(
								{ name: "Rename data page", op: "r2.rename" },
								() => r2rename(dataPageKey, `${passportNumber}.png`),
							),
							Sentry.startSpan(
								{ name: "Rename portrait", op: "r2.rename" },
								() => r2rename(portraitKey, `${passportNumber}-portrait.png`),
							),
						]),
				);
			} catch (error) {
				console.log(error);
				captureException(error);
				return Response.json(
					{ ok: false, error: "Error uploading image(s) to R2" },
					{ status: 500 },
				);
			}
		}
	}

	const imageUrl = await generatePreSignedUrl(dataPageKey, "GET");
	Sentry.logger.info("Generated passport", { passportNumber });
	return Response.json({
		imageUrl,
		imageKey: dataPageKey,
	});
}
