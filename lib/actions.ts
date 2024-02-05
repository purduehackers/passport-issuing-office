"use server";

import prisma from "@/lib/prisma";
import { parseFormData } from "./parse-form-data";
import { CURRENT_PASSPORT_VERSION } from "@/config";

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
