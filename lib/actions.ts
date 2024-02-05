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

// NOTE: THIS DOES NOT WORK, AT THIS POINT IT'S BASICALLY PSEUDOCODE

export async function createPassport(data: FormData) {
  const {
    trueID,
    trueSurname,
    trueFirstName,
    trueDateOfBirth,
    trueDateOfIssue,
    placeOfOrigin,
    portraitImage,
    userId,
  } = parseFormData(data);

  if (userId) {
    const existingRecord = await prisma.passport.findFirst({
      where: {
        owner_id: userId,
      },
    });
    if (!existingRecord) {
      await prisma.passport.create({
        data: {
          owner_id: userId,
          version: CURRENT_PASSPORT_VERSION,
          sequence: 0, // TODO,
          surname: trueSurname,
          name: trueFirstName,
          date_of_birth: trueDateOfBirth,
          date_of_issue: trueDateOfIssue,
          place_of_origin: placeOfOrigin,
          // TODO: portrait
        },
      });
    } else {
      await prisma.passport.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          owner_id: userId,
          version: CURRENT_PASSPORT_VERSION,
          sequence: 0, // TODO,
          surname: trueSurname,
          name: trueFirstName,
          date_of_birth: trueDateOfBirth,
          date_of_issue: trueDateOfIssue,
          place_of_origin: placeOfOrigin,
          // TODO: portrait
        },
      });
    }
  }

  return { success: true };
}
