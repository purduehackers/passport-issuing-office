import { generateFullFrame } from "@/lib/generate-data-page";
import { parseFormData } from "@/lib/parse-form-data";
import { serverR2Download, serverR2Upload } from "@/lib/r2";
import { captureException } from "@sentry/nextjs";

export const runtime = "edge";

export async function POST(request: Request) {
	if (process.env.PRODUCTION) {
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

		const fullFrameRes = await generateFullFrame(
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
				sendToDb,
			},
			request.url,
		);
		const fullFrameBlob = await fullFrameRes.blob();
		const fullFrameFile = new File([fullFrameBlob], "data_page.png", {
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
				serverR2Upload(`${trueID}-full.png`, fullFrameFile),
				serverR2Upload(`${trueID}-portrait.png`, portraitImage),
				serverR2Upload(`${trueID}.png`, datapageImage),
			]);
		} catch (error) {
			console.log(error);
			captureException(error);
			return Response.json(
				{ ok: false, error: `Error uploading image(s) to R2` },
				{ status: 500 },
			);
		}
	}

	return Response.json({ ok: true });
}
