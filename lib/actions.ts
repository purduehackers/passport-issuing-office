"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseFormData } from "./parse-form-data";

export async function getPreSignedUrl(
	which: "generated" | "full",
	passportNumber: string | undefined,
) {
	const S3 = new S3Client({
		region: "auto",
		endpoint: `${process.env.R2_ENDPOINT}`,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
		},
	});

	const Key =
		which === "generated"
			? (passportNumber || "0") + ".png"
			: `${passportNumber}-full.png` || "0-full.png";

	const preSignedUrl = await getSignedUrl(
		S3,
		new PutObjectCommand({
			Bucket: "passport-portraits",
			Key,
		}),
		{
			expiresIn: 3600,
		},
	);

	return preSignedUrl;
}

export async function uploadImageToR2(
	which: "generated" | "full",
	data: FormData,
	passportNumber: string,
) {
	let imageToUpload;
	if (which === "generated") {
		imageToUpload = data.get("generatedImage") as File;
	} else {
		imageToUpload = data.get("fullFrameImage") as File;
	}

	const preSignedUrl = await getPreSignedUrl(which, passportNumber);
	const r2Upload = await fetch(preSignedUrl, {
		method: "PUT",
		body: imageToUpload,
	});
	if (r2Upload.status !== 200) {
		// Retry
		const r2UploadRetry = await fetch(preSignedUrl, {
			method: "PUT",
			body: imageToUpload,
		});
		if (r2UploadRetry.status !== 200) {
			throw new Error(`Error uploading: ${preSignedUrl}`);
		}
	}
}

export async function createPassport(formData: FormData) {
	const {
		trueSurname,
		trueFirstName,
		trueDateOfBirth,
		trueDateOfIssue,
		placeOfOrigin,
		stringUserId,
	} = parseFormData(formData);
	const newPassport = await fetch(`https://id.purduehackers.com/api/new`, {
		method: "POST",
		body: JSON.stringify({
			discord_id: stringUserId,
			surname: trueSurname,
			name: trueFirstName,
			date_of_birth: trueDateOfBirth,
			date_of_issue: trueDateOfIssue,
			place_of_origin: placeOfOrigin,
		}),
	}).then((r) => r.json());
	return {
		passportNumber: newPassport.id,
	};
}
