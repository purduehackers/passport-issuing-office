import { generateDataPage, generateFullFrame } from "@/lib/generate-data-page";
import {
	generatePreSignedUrl,
	r2rename,
	serverR2Download,
	serverR2Upload,
} from "@/lib/r2";
import { GeneratePassportSchema } from "@/types/types";
import { captureException } from "@sentry/nextjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const parsed = GeneratePassportSchema.safeParse(await request.json());
	if (!parsed.success) {
		return Response.json(
			{ ok: false, error: "Invalid request body", details: parsed.error.flatten() },
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

	const dataPageFile = await generateDataPage(genData, request.url);
	const dataPageKey = `temp/${crypto.randomUUID()}.png`;
	try {
		await serverR2Upload(dataPageKey, dataPageFile);
	} catch (error) {
		captureException(error);
		return Response.json(
			{ ok: false, error: "Failed to upload generated image to R2" },
			{ status: 500 },
		);
	}

	if (sendToDb) {
		const fullFrameFile = await generateFullFrame(dataPageFile);

		if (process.env.PRODUCTION) {
			try {

				await Promise.all([
					serverR2Upload(`${passportNumber}-full.png`, fullFrameFile),
					r2rename(dataPageKey, `${passportNumber}.png`),
					r2rename(portraitKey, `${passportNumber}-portrait.png`),
				]);
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

	return Response.json({
		imageUrl: await generatePreSignedUrl(dataPageKey, "GET"),
		imageKey: dataPageKey,
	});
}
