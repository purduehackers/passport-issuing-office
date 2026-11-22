import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { PORTRAIT_MAX_BYTES, validateFields, type PassportFields } from "../passport";
import type { User } from "./auth";
import { db } from "./db";
import { passportRequest, type PassportRequest, type RequestStatus } from "./db/schema";
import { createPassports } from "./id-passports";
import { remove, store } from "./storage";

export class RequestError extends Error {
  constructor(
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Where browsers load a request's portrait. The version changes when the request changes. */
export const portraitPath = (request: Pick<PassportRequest, "id" | "updatedAt">) =>
  `/portraits/${request.id}?v=${request.updatedAt.getTime()}`;

export async function latestRequestOf(userId: string) {
  const [row] = await db
    .select()
    .from(passportRequest)
    .where(eq(passportRequest.userId, userId))
    .orderBy(desc(passportRequest.createdAt))
    .limit(1);
  return row ?? null;
}

async function pendingRequestOf(userId: string) {
  const [row] = await db
    .select()
    .from(passportRequest)
    .where(and(eq(passportRequest.userId, userId), eq(passportRequest.status, "pending")))
    .limit(1);
  return row ?? null;
}

const isJpeg = (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

async function storePortrait(file: File) {
  if (file.size > PORTRAIT_MAX_BYTES) throw new RequestError("The portrait is too large.", { portrait: "Use a smaller picture." });
  const head = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  if (!isJpeg(head)) throw new RequestError("The portrait must be a JPEG.", { portrait: "Crop the picture again." });
  return store("portraits", file, "image/jpeg", "jpg");
}

function readFields(form: FormData): PassportFields {
  const text = (name: string) => String(form.get(name) ?? "").trim();
  return {
    firstName: text("firstName"),
    surname: text("surname"),
    placeOfOrigin: text("placeOfOrigin"),
    dateOfBirth: text("dateOfBirth"),
  };
}

/** Makes a request for the member, or changes their request if it is still pending. */
export async function submitRequest(user: User, form: FormData) {
  const fields = readFields(form);
  const errors = validateFields(fields);
  if (Object.keys(errors).length) throw new RequestError("Some fields need changes.", errors);

  const portrait = form.get("portrait");
  const newPortrait = portrait instanceof File && portrait.size > 0 ? portrait : null;
  const existing = await pendingRequestOf(user.id);
  if (!existing && !newPortrait) throw new RequestError("Add a portrait.", { portrait: "Add a portrait." });

  const portraitUrl = newPortrait ? await storePortrait(newPortrait) : existing!.portraitUrl;
  const owner = { username: user.username, name: user.name, email: user.email };

  try {
    if (existing) {
      await db
        .update(passportRequest)
        .set({ ...fields, ...owner, portraitUrl, updatedAt: new Date() })
        .where(and(eq(passportRequest.id, existing.id), eq(passportRequest.status, "pending")));
    } else {
      await db.insert(passportRequest).values({ id: crypto.randomUUID(), userId: user.id, ...owner, ...fields, portraitUrl });
    }
  } catch (error) {
    if (newPortrait) await remove(portraitUrl).catch(() => {});
    throw error;
  }
  if (existing && newPortrait) await remove(existing.portraitUrl).catch(() => {});
}

export async function withdrawRequest(userId: string) {
  const [removed] = await db
    .delete(passportRequest)
    .where(and(eq(passportRequest.userId, userId), eq(passportRequest.status, "pending")))
    .returning({ portraitUrl: passportRequest.portraitUrl });
  if (removed) await remove(removed.portraitUrl).catch(() => {});
}

export async function listRequests(status: RequestStatus | "all") {
  const query = db.select().from(passportRequest);
  return (status === "all" ? query : query.where(eq(passportRequest.status, status))).orderBy(
    asc(passportRequest.createdAt),
  );
}

export async function requestsById(ids: string[]) {
  if (!ids.length) return [];
  return db.select().from(passportRequest).where(inArray(passportRequest.id, ids)).orderBy(asc(passportRequest.createdAt));
}

/**
 * Issues passports: creates them in ID for the requests that have none and marks all of them issued.
 * Requests that were issued before keep their passports, so they can be printed again.
 */
export async function issuePassports(ids: string[]) {
  const requests = await requestsById(ids);
  const unnumbered = requests.filter((r) => r.passportNumber === null);
  const numbers = unnumbered.length ? await createPassports(unnumbered) : [];
  const now = new Date();
  for (const r of requests) {
    const index = unnumbered.indexOf(r);
    if (index >= 0) r.passportNumber = numbers[index];
    r.issuedAt ??= now;
    await db
      .update(passportRequest)
      .set({ status: "issued", passportNumber: r.passportNumber, issuedAt: r.issuedAt, updatedAt: now })
      .where(eq(passportRequest.id, r.id));
  }
  return requests
    .map((r) => ({ id: r.id, number: r.passportNumber!, name: `${r.firstName} ${r.surname}` }))
    .sort((a, b) => a.number - b.number);
}
