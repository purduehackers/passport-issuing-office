import { uploadImageToR2 } from "@/lib/actions";
import { generateFullFrame } from "@/lib/generate-data-page";
import { parseFormData } from "@/lib/parse-form-data";

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
			portraitImage,
			datapageImage,
			sendToDb,
		} = parseFormData(formValues);

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

		const datapageData = new FormData();
		datapageData.append("fullFrameImage", fullFrameFile);

		try {
			await uploadImageToR2("full", datapageData, String(trueID));
		} catch (error) {
			return Response.json(
				{
					ok: false,
					error: `Error uploading full image to R2: ${error}`,
				},
				{
					status: 500,
				},
			);
		}

		const portraitData = new FormData();
		portraitData.append("portraitImage", portraitImage);

		try {
			await uploadImageToR2("portrait", portraitData, String(trueID));
		} catch (error) {
			return Response.json(
				{
					ok: false,
					error: `Error uploading full image to R2: ${error}`,
				},
				{
					status: 500,
				},
			);
		}
	}

	return Response.json({ ok: true });
}
