import { generateDataPage } from "@/utils/generate-data-page";
import { parseFormData } from "@/utils/parse-form-data";

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
  } = parseFormData(formValues);

  return await generateDataPage(
    {
      passportNumber: trueID,
      surname: trueSurname,
      firstName: trueFirstName,
      dateOfBirth: trueDateOfBirth,
      dateOfIssue: trueDateOfIssue,
      placeOfOrigin,
      portrait: portraitImage,
    },
    request.url
  );
}
