import { generateDataPage, generateFullFrame } from "@/lib/generate-data-page";
import {
	generatePreSignedUrl,
	serverR2Download,
	serverR2Upload,
} from "@/lib/r2";
import { GeneratePassportSchema } from "@/types/types";
import { captureException } from "@sentry/nextjs";

export const runtime = "edge";

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

	let portraitImage: File;
	let stylizedPortraitImage: File;
	try {
		[portraitImage, stylizedPortraitImage] = await Promise.all([
			serverR2Download(portraitKey, "portrait.png"),
			serverR2Download(stylizedPortraitKey, "stylized-portrait.png"),
		]);
	} catch (error) {
		captureException(error);
		return Response.json(
			{ ok: false, error: "Failed to download image(s) from R2" },
			{ status: 500 },
		);
	}

	const genData = {
		passportNumber,
		surname,
		firstName,
		dateOfBirth,
		dateOfIssue,
		ceremonyTime,
		placeOfOrigin,
		portrait: portraitImage,
		stylizedPortrait: stylizedPortraitImage,
		sendToDb,
	};

	const img = await generateDataPage(genData, request.url);
	const dataPageBlob = await img.blob();
	const dataPageKey = `temp/${crypto.randomUUID()}.png`;
	try {
		await serverR2Upload(dataPageKey, dataPageBlob);
	} catch (error) {
		captureException(error);
		return Response.json(
			{ ok: false, error: "Failed to upload generated image to R2" },
			{ status: 500 },
		);
	}

	if (sendToDb && process.env.PRODUCTION) {
		const dataPageFile = new File([dataPageBlob], "data_page.png", {
			type: "image/png",
		});

		const fullFrameRes = await generateFullFrame(genData, request.url);
		const fullFrameBlob = await fullFrameRes.blob();
		const fullFrameFile = new File([fullFrameBlob], "full_frame.png", {
			type: "image/png",
		});

		try {
			// FIXME: Here, it would be cleaner and faster to move the temporary
			// datapage and portrait objects that are already in R2 to their
			// final locations. However, the S3 client uses the FileReader API
			// for either the Copy or Delete operation, which isn't supported in
			// the Vercel Edge Runtime. So if we ever switch away from the Edge
			// runtime, re-implement
			// https://github.com/purduehackers/passport-issuing-office/commit/c41bca707fc3e36dfd67656c5ac5c97920e8f872
			await Promise.all([
				serverR2Upload(`${passportNumber}-full.png`, fullFrameFile),
				serverR2Upload(`${passportNumber}-portrait.png`, portraitImage),
				serverR2Upload(`${passportNumber}.png`, dataPageFile),
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

	return Response.json({
		imageUrl: await generatePreSignedUrl(dataPageKey, "GET"),
		imageKey: dataPageKey,
	});
}
