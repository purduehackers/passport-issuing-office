import { generateDataPage } from "@/lib/generate-data-page";
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
		trueCeremonyTime,
		placeOfOrigin,
		portraitImage,
		sendToDb,
	} = parseFormData(formValues);

	return await generateDataPage(
		{
			passportNumber: trueID,
			surname: trueSurname,
			firstName: trueFirstName,
			dateOfBirth: trueDateOfBirth,
			dateOfIssue: trueDateOfIssue,
			ceremonyTime: trueCeremonyTime,
			placeOfOrigin,
			portrait: portraitImage,
			sendToDb: sendToDb == "true",
		},
		request.url,
	);
}
