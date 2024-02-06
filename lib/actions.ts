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

export async function uploadImageToR2(data: FormData, passportNumber: string) {
  const generatedImage = data.get("generatedImage") as File;
  const preSignedUrl = await getPreSignedUrl(passportNumber);
  await fetch(preSignedUrl, {
    method: "PUT",
    body: generatedImage,
  });
}

export async function createPassport(formData: FormData) {
  const {
    trueSurname,
    trueFirstName,
    trueDateOfBirth,
    trueDateOfIssue,
    placeOfOrigin,
    userId,
  } = parseFormData(formData);
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

  const data = {
    owner_id: user.id,
    version: CURRENT_PASSPORT_VERSION,
    surname: trueSurname,
    name: trueFirstName,
    date_of_birth: trueDateOfBirth,
    date_of_issue: trueDateOfIssue,
    place_of_origin: placeOfOrigin,
  };

  const existingRecord = await prisma.passport.findFirst({
    where: {
      owner_id: user.id,
    },
    orderBy: {
      id: "desc",
    },
  });
  if (existingRecord && !existingRecord.activated) {
    await prisma.passport.update({
      where: {
        id: existingRecord.id,
      },
      data,
    });
    return {
      success: true,
      passportNumber: existingRecord.id,
    };
  } else {
    const newRecord = await prisma.passport.create({
      data,
    });
    return {
      success: true,
      passportNumber: newRecord.id,
    };
  }
}
