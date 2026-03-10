"use server";

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

export async function createPassport(data: {
	surname: string;
	firstName: string;
	dateOfBirth: Date | string;
	dateOfIssue?: Date | string;
	placeOfOrigin: string;
	ceremonyTime?: Date | string;
	userId?: string;
}) {
	const newPassport = await fetch("https://id.purduehackers.com/api/new", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			discord_id: data.userId,
			surname: data.surname,
			name: data.firstName,
			date_of_birth: data.dateOfBirth,
			date_of_issue: data.dateOfIssue ?? new Date(),
			place_of_origin: data.placeOfOrigin,
			ceremony_time: data.ceremonyTime ?? new Date(),
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
