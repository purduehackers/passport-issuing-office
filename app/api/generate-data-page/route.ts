import { generateDataPage } from "@/lib/generate-data-page";
import { parseFormData } from "@/lib/parse-form-data";
import {
	generatePreSignedUrl,
	serverR2Download,
	serverR2Upload,
} from "@/lib/r2";
import { captureException } from "@sentry/nextjs";

export const runtime = "edge";

export async function POST(request: Request) {
	const formValues = await request.formData();

	const {
		trueID,
		trueSurname,
		trueFirstName,
		trueDateOfBirth,
		trueDateOfIssue,
		trueCeremonyTime,
		placeOfOrigin,
		portraitImageObjectKey,
		datapageImageObjectKey,
		sendToDb,
	} = parseFormData(formValues);

	for (const key of [portraitImageObjectKey, datapageImageObjectKey]) {
		// Return 403 forbidden if the client tries to use an image other than a temporary one.
		// We assume any temporary one belongs to the requesting user because the chance of them correctly
		// guessing a random UUID is negligible.
		if (!key.startsWith("temp/")) {
			return Response.json(
				{
					ok: false,
					error:
						"Invalid object image key. Only temporary images can be used.",
					details: { key },
				},
				{ status: 403 },
			);
		}
	}
	let portraitImage: File;
	let datapageImage: File;
	try {
		[portraitImage, datapageImage] = await Promise.all([
			serverR2Download(portraitImageObjectKey, "portrait.png"),
			serverR2Download(datapageImageObjectKey, "datapage.png"),
		]);
	} catch (error) {
		captureException(error);
		return Response.json(
			{ ok: false, error: "Failed to download image(s) from R2" },
			{ status: 500 },
		);
	}

	const img = await generateDataPage(
		{
			passportNumber: trueID,
			surname: trueSurname,
			firstName: trueFirstName,
			dateOfBirth: trueDateOfBirth,
			dateOfIssue: trueDateOfIssue,
			ceremonyTime: trueCeremonyTime,
			placeOfOrigin,
			portrait: portraitImage,
			datapage: datapageImage,
			sendToDb: sendToDb,
		},
		request.url,
	);
	const blob = await img.blob();
	const key = `temp/${crypto.randomUUID()}.png`;
	try {
		await serverR2Upload(key, blob);
	} catch (error) {
		captureException(error);
		return Response.json(
			{ ok: false, error: `Failed to upload generated image to R2` },
			{ status: 500 },
		);
	}
	return Response.json({
		imageUrl: await generatePreSignedUrl(key, "GET"),
		imageKey: key,
	});
}
