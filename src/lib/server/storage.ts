import { del, put } from "@vercel/blob";
import { BLOB_READ_WRITE_TOKEN } from "astro:env/server";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_DIR = ".local-blob";
export const LOCAL_PREFIX = "/dev-blob/";

const useLocal = () => !BLOB_READ_WRITE_TOKEN;

function localPath(key: string) {
  const file = path.resolve(LOCAL_DIR, key);
  if (!file.startsWith(path.resolve(LOCAL_DIR) + path.sep)) throw new Error("Invalid key");
  return file;
}

/** Stores a file and returns its public URL. */
export async function store(prefix: string, body: Blob, contentType: string, extension: string) {
  const key = `${prefix}/${crypto.randomUUID()}.${extension}`;
  if (useLocal()) {
    if (!import.meta.env.DEV) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
    await mkdir(path.dirname(localPath(key)), { recursive: true });
    await writeFile(localPath(key), Buffer.from(await body.arrayBuffer()));
    return LOCAL_PREFIX + key;
  }
  const blob = await put(key, body, {
    access: "public",
    contentType,
    addRandomSuffix: true,
    token: BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

export async function remove(url: string) {
  if (url.startsWith(LOCAL_PREFIX)) {
    await rm(localPath(url.slice(LOCAL_PREFIX.length)), { force: true });
    return;
  }
  await del(url, { token: BLOB_READ_WRITE_TOKEN });
}

export async function readLocal(key: string) {
  return readFile(localPath(key));
}
