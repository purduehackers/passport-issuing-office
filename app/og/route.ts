import { generateDataPage } from "@/utils/generate-data-page";

export const runtime = "edge";

export async function POST(request: Request) {
  const formValues = await request.formData();

  // TODO: fix types

  const trueID = formValues.get("passportNumber")
    ? Number(formValues.get("passportNumber") as string)
    : 0;

  const trueSurname = formValues.get("surname")
    ? (formValues.get("surname") as string)
    : "HACKER";
  const trueFirstName = formValues.get("firstName")
    ? (formValues.get("firstName") as string)
    : "WACK";

  const trueDateOfBirth = new Date(
    formValues.get("dateOfBirth")
      ? (formValues.get("dateOfBirth") as string)
      : "06 Apr 1200"
  );
  const trueDateOfIssue = new Date(
    formValues.get("dateOfIssue")
      ? (formValues.get("dateOfIssue") as string)
      : Date.now()
  );
  const placeOfOrigin = formValues.get("placeOfOrigin")
    ? (formValues.get("placeOfOrigin") as string)
    : "THE WOODS";
  const portraitImage = formValues.get("portrait") as File;

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
