import { uploadImageToR2 } from "@/lib/actions";
import { generateFullFrame } from "@/lib/generate-data-page";
import { parseFormData } from "@/lib/parse-form-data";

export const runtime = "edge";

export async function POST(request: Request) {
	const formValues = await request.formData();

	const {
		trueID,
		trueSurname,
		trueFirstName,
		trueDateOfBirth,
		trueDateOfIssue,
		placeOfOrigin,
		portraitImage,
		sendToDb,
	} = parseFormData(formValues);

	const fullFrameRes = await generateFullFrame(
		{
			passportNumber: trueID,
			surname: trueSurname,
			firstName: trueFirstName,
			dateOfBirth: trueDateOfBirth,
			dateOfIssue: trueDateOfIssue,
			placeOfOrigin,
			portrait: portraitImage,
			sendToDb: sendToDb === "true",
		},
		request.url,
	);
	const fullFrameBlob = await fullFrameRes.blob();
	const fullFrameFile = new File([fullFrameBlob], "data_page.png", {
		type: "image/png",
	});

	const data = new FormData();
	data.append("fullFrameImage", fullFrameFile);

	await uploadImageToR2("full", data, String(trueID));

	return Response.json({ ok: true });
}
