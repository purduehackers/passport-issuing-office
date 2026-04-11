import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	GetObjectCommandInput,
	PutObjectCommand,
	PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { getPreSignedUrl } from "./actions";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { startSpan } from "@sentry/nextjs";

const R2_BUCKET = "passport-portraits";

function getClient(): S3Client {
	return new S3Client({
		region: "auto",
		endpoint: `${process.env.R2_ENDPOINT}`,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
		},
	});
}

/**
 * Generates a pre-signed URL. Must be called from the server.
 */
export async function generatePreSignedUrl(
	objectKey: string,
	method: "PUT" | "GET",
	expiresInSecs: number = 600,
): Promise<string> {
	return startSpan(
		{ name: `Generate pre-signed ${method} URL`, op: "r2.presign" },
		async () => {
			const options: PutObjectCommandInput & GetObjectCommandInput = {
				Bucket: R2_BUCKET,
				Key: objectKey,
			};
			return await getSignedUrl(
				getClient(),
				method === "PUT"
					? new PutObjectCommand(options)
					: new GetObjectCommand(options),
				{
					expiresIn: expiresInSecs,
				},
			);
		},
	);
}

/**
 * Uploads the given image to R2 for temporary storage.
 * Objects will be automatically removed after one day due to retention policies.
 * @param file image contents
 * @returns the uploaded object key
 */
export async function clientR2Upload(
	file: File | Blob,
	contentType: string = "image/png",
	attempts: number = 2,
): Promise<string> {
	// NOTE: we can force a specific file size in the pre-signed URL in order to
	// avoid abuse via uploading gigabytes of files.
	const { url, objectKey } = await getPreSignedUrl();
	for (let i = 0; i < attempts; i++) {
		try {
			const response = await fetch(url, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": contentType,
				},
			});
			if (response.ok) break;
			console.warn("Error uploading to R2 (bad response)", response);
			if (i === attempts - 1) {
				throw new Error(
					`Error uploading to R2 (bad response): ${response.status} ${response.statusText}`,
					{ cause: response },
				);
			}
		} catch (error) {
			if (i === attempts - 1 && error instanceof Error) {
				throw new Error(`Error uploading to R2 (fetch failed)`, {
					cause: error,
				});
			} else {
				console.warn("Error uploading to R2 (fetch failed)", error);
			}
		}
	}
	return objectKey;
}

/**
 * Uploads a file to R2 from the server-side.
 * @param key desired object key
 * @param file file/blob to upload
 * @param attempts number of times to attempt uploading before failing
 * @returns what S3Client.send() returns
 */
export async function serverR2Upload(
	key: string,
	file: Exclude<PutObjectCommandInput["Body"], undefined>,
	contentType: string = "image/png",
	attempts: number = 2,
) {
	const body =
		file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;
	for (let i = 0; i < attempts; i++) {
		try {
			const response = await getClient().send(
				new PutObjectCommand({
					Bucket: R2_BUCKET,
					Key: key,
					Body: body,
					ContentType: contentType,
				}),
			);
			return response;
		} catch (error) {
			console.warn(
				`Failed to upload to R2. ${attempts - i - 1} attempts left: ${(error as Error).message}`,
			);
		}
	}
	throw new Error(`Failed to upload to R2 after ${attempts} attempts`);
}

export async function serverR2Download(
	key: string,
	filename?: string,
): Promise<File> {
	const response = await getClient().send(
		new GetObjectCommand({
			Bucket: R2_BUCKET,
			Key: key,
		}),
	);
	const bytes = await response.Body?.transformToByteArray();
	if (!bytes) throw new Error(`Downloaded R2 object has no body: ${key}`);
	return new File([Buffer.from(bytes)], filename ?? "downloaded-file", {
		type: "image/png",
	});
}

/**
 * Copies an object in R2, then deletes the original.
 * Effectively renames an object.
 * @param src source object key
 * @param dst destination object key
 */
export async function r2rename(src: string, dst: string) {
	const s3 = getClient();
	await s3.send(
		new CopyObjectCommand({
			Bucket: R2_BUCKET,
			Key: dst,
			CopySource: `${R2_BUCKET}/${src}`,
		}),
	);
	await s3.send(
		new DeleteObjectCommand({
			Bucket: R2_BUCKET,
			Key: src,
		}),
	);
}
