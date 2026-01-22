"use server";

import { parseFormData } from "./parse-form-data";
import { generatePreSignedUrl } from "./r2";

/**
 * Server action to get a pre-signed URL for client upload.
 * Use clientR2Upload() instead of calling this directly.
 */
export async function getPreSignedUrl() {
	const key = `temp/${crypto.randomUUID()}.png`;
	return {
		method: "PUT",
		url: await generatePreSignedUrl(key, "PUT"),
		objectKey: key,
	};
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
