export async function uploadToPresignedUrl(
	presignedUrl: string,
	file: File | Blob,
): Promise<void> {
	const response = await fetch(presignedUrl, {
		method: "PUT",
		body: file,
	});

	if (response.status !== 200) {
		// Retry once
		const retryResponse = await fetch(presignedUrl, {
			method: "PUT",
			body: file,
		});
		if (retryResponse.status !== 200) {
			throw new Error(`Error uploading to presigned URL. Status code: ${retryResponse.status}`);
		}
	}
}
