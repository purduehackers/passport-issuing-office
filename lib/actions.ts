"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseFormData } from "./parse-form-data";

export async function getPreSignedUrl(
	which: "generated" | "full" | "portrait",
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

	let Key = "";

	if (which === "generated") {
		Key = (passportNumber || "0") + ".png";
	} else if (which === "portrait") {
		Key = (passportNumber || "0") + "-portrait.png";
	} else {
		Key = (passportNumber || "0") + "-full.png";
	}

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
	which: "generated" | "full" | "portrait",
	data: FormData,
	passportNumber: string,
) {
	let imageToUpload;
	if (which === "generated") {
		imageToUpload = data.get("generatedImage") as File;
	} else if (which === "portrait") {
		imageToUpload = data.get("portraitImage") as File;
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
		trueCeremonyTime,
		placeOfOrigin,
		stringUserId,
	} = parseFormData(formData);
	const newPassport = await fetch("https://id.purduehackers.com/api/new", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			discord_id: stringUserId,
			surname: trueSurname,
			name: trueFirstName,
			date_of_birth: trueDateOfBirth,
			date_of_issue: trueDateOfIssue,
			place_of_origin: placeOfOrigin,
			ceremony_time: trueCeremonyTime,
		}),
	})
		.then((r) => r.json())
		.catch((err) => console.log("Error fetching new passport:", err));
	return {
		passportNumber: newPassport.id,
	};
}

// export async function getNewIdApi() {
// 	if (process.env.PRODUCTION) {
// 		return `https://id.purduehackers.com/api/new`;
// 	}
// 	return `https://id.purduehackers.com/api/new`;
// }

// export async function apiHeaders() {
// 	if (process.env.PRODUCTION) {
// 		return {} as HeadersInit;
// 	}
// 	return {
// 		"x-vercel-protection-bypass": process.env
// 			.ID_STAGING_AUTHENTICATION as string,
// 	} as HeadersInit;
// }
