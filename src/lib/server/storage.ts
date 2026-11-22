import { del, get, put } from "@vercel/blob";
import { BLOB_READ_WRITE_TOKEN } from "astro:env/server";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_DIR = ".local-blob";
const LOCAL_PREFIX = "local:";

// Vercel connects stores with a read-write token or with OIDC (BLOB_STORE_ID).
const token = BLOB_READ_WRITE_TOKEN || undefined;
const useLocal = () => !token && !process.env.BLOB_STORE_ID;

function localPath(key: string) {
  const file = path.resolve(LOCAL_DIR, key);
  if (!file.startsWith(path.resolve(LOCAL_DIR) + path.sep)) throw new Error("Invalid key");
  return file;
}

/**
 * Stores a private file and returns a reference to it.
 * Never send the reference to a browser. Serve the file through a route that checks access.
 */
export async function store(prefix: string, body: Blob, contentType: string, extension: string) {
  const key = `${prefix}/${crypto.randomUUID()}.${extension}`;
  if (useLocal()) {
    if (!import.meta.env.DEV) throw new Error("No Vercel Blob store is connected");
    await mkdir(path.dirname(localPath(key)), { recursive: true });
    await writeFile(localPath(key), Buffer.from(await body.arrayBuffer()));
    return LOCAL_PREFIX + key;
  }
  const blob = await put(key, body, { access: "private", contentType, addRandomSuffix: true, token });
  return blob.url;
}

/** Reads a stored file. Returns null if it does not exist. */
export async function open(ref: string): Promise<{ body: BodyInit; contentType: string } | null> {
  if (ref.startsWith(LOCAL_PREFIX)) {
    try {
      return { body: await readFile(localPath(ref.slice(LOCAL_PREFIX.length))), contentType: "image/jpeg" };
    } catch {
      return null;
    }
  }
  const result = await get(ref, { access: "private", token });
  if (!result || result.statusCode !== 200) return null;
  return { body: result.stream, contentType: result.blob.contentType };
}

/** Reads a whole stored file. Returns null if it does not exist. */
export async function read(ref: string) {
  const file = await open(ref);
  return file ? Buffer.from(await new Response(file.body).arrayBuffer()) : null;
}

export async function remove(ref: string) {
  if (ref.startsWith(LOCAL_PREFIX)) {
    await rm(localPath(ref.slice(LOCAL_PREFIX.length)), { force: true });
    return;
  }
  await del(ref, { token });
}
