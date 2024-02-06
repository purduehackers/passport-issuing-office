import { generateDataPage } from "@/lib/generate-data-page";
import prisma from "@/lib/prisma";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get("discordId");
  if (!discordId) {
    return null;
  }
  const bigIntDiscordId = BigInt(discordId);

  const user = await prisma.user.findFirst({
    where: {
      discord_id: bigIntDiscordId,
    },
  });
  if (!user) {
    return null;
  }

  const latestPassport = await prisma.passport.findFirst({
    where: {
      owner_id: user.id,
    },
  });
  if (!latestPassport) {
    return null;
  }

  const defaultPortraitBlob = await (
    await fetch(`${process.env.R2_PUBLIC_URL}/default-portrait.png`)
  ).blob();
  const defaultPortraitFile = new File(
    [defaultPortraitBlob],
    "default_portrait.png",
    {
      type: "image/png",
    }
  );

  return await generateDataPage({
    passportNumber: 0, // Intentionally obscuring passport image
    surname: latestPassport.surname,
    firstName: latestPassport.name,
    dateOfBirth: latestPassport.date_of_birth,
    dateOfIssue: latestPassport.date_of_issue,
    placeOfOrigin: latestPassport.place_of_origin,
    portrait: defaultPortraitFile,
  });
}
