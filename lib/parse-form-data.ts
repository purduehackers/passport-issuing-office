export function parseFormData(formValues: FormData) {
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

  const sendToDb = formValues.get("sendToDb") as string | undefined;
  const portraitImage = formValues.get("portrait") as File;
  const userId = formValues.get("userId") as string | undefined;
  const bigIntUserId = BigInt(`${userId || "0"}`);

  return {
    trueID,
    trueSurname,
    trueFirstName,
    trueDateOfBirth,
    trueDateOfIssue,
    placeOfOrigin,
    sendToDb,
    portraitImage,
    userId: bigIntUserId,
    stringUserId: userId,
  };
}
