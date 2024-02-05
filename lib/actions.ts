"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";
import { parseFormData } from "./parse-form-data";
import { CURRENT_PASSPORT_VERSION } from "@/config";

export async function getPreSignedUrl(passportNumber: string | undefined) {
  const S3 = new S3Client({
    region: "auto",
    endpoint: `${process.env.R2_ENDPOINT}`,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });

  const preSignedUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: "passport-portraits",
      Key: passportNumber || "0",
    }),
    {
      expiresIn: 3600,
    }
  );

  return preSignedUrl;
}

async function uploadImageToR2(image: File, passportNumber: string) {
  const preSignedUrl = await getPreSignedUrl(passportNumber);
  await fetch(preSignedUrl, {
    method: "PUT",
    body: image,
  });
}

// NOTE: THIS DOES NOT WORK, AT THIS POINT IT'S BASICALLY PSEUDOCODE

export async function createPassport(data: FormData) {
  const {
    trueSurname,
    trueFirstName,
    trueDateOfBirth,
    trueDateOfIssue,
    placeOfOrigin,
    userId,
  } = parseFormData(data);
  const generatedImage = data.get("generatedImage") as File;
  const bigIntUserId = BigInt(`${userId}`);

  let user = await prisma.user.findFirst({
    where: {
      discord_id: bigIntUserId,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        discord_id: bigIntUserId,
        role: "hacker",
      },
    });
  }

  const existingRecord = await prisma.passport.findFirst({
    where: {
      owner_id: user.id,
    },
  });
  if (existingRecord && !existingRecord.activated) {
    await prisma.passport.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        owner_id: user.id,
        version: CURRENT_PASSPORT_VERSION,
        surname: trueSurname,
        name: trueFirstName,
        date_of_birth: trueDateOfBirth,
        date_of_issue: trueDateOfIssue,
        place_of_origin: placeOfOrigin,
      },
    });

    // Replace image in R2
    const passportNumber = String(existingRecord.id);
    await uploadImageToR2(generatedImage, passportNumber);
  } else {
    const newRecord = await prisma.passport.create({
      data: {
        owner_id: user.id,
        version: CURRENT_PASSPORT_VERSION,
        surname: trueSurname,
        name: trueFirstName,
        date_of_birth: trueDateOfBirth,
        date_of_issue: trueDateOfIssue,
        place_of_origin: placeOfOrigin,
      },
    });

    const newPassportNumber = String(newRecord.id);
    await uploadImageToR2(generatedImage, newPassportNumber);
  }

  return { success: true };
}
