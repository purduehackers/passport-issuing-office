import * as oauth from "oauth4webapi";
import { ID_ISSUER } from "astro:env/server";
import { authorizationServer, client, clientAuth } from "./auth";
import type { PassportRequest } from "./db/schema";

const RESOURCE = "https://id.purduehackers.com/api/passports";
const SCOPE = "passports:issue";
const EXPIRY_MARGIN = 30_000;

let dpopHandle: Promise<oauth.DPoPHandle> | null = null;
let token: { value: string; expiresAt: number } | null = null;

/** One handle for the whole process, because it remembers the nonces that ID sends. */
const dpop = () => (dpopHandle ??= oauth.generateKeyPair("ES256").then((keys) => oauth.DPoP(client, keys)));

function challenge(error: unknown) {
  if (!(error instanceof oauth.WWWAuthenticateChallengeError)) return null;
  return error.cause.find((c) => c.scheme === "dpop" || c.scheme === "bearer")?.parameters ?? null;
}

function refusal(error: unknown) {
  const params = challenge(error);
  if (!params) return error;
  return new Error(`ID refused the request: ${params.error_description ?? params.error ?? "no reason"}`);
}

async function accessToken() {
  if (token && token.expiresAt > Date.now()) return token.value;
  const as = await authorizationServer();
  const DPoP = await dpop();
  const request = () =>
    oauth.clientCredentialsGrantRequest(as, client, clientAuth, { scope: SCOPE, resource: RESOURCE }, { DPoP });
  let result: oauth.TokenEndpointResponse;
  try {
    result = await oauth.processClientCredentialsResponse(as, client, await request());
  } catch (error) {
    if (!oauth.isDPoPNonceError(error)) throw error;
    result = await oauth.processClientCredentialsResponse(as, client, await request());
  }
  token = { value: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 300) * 1000 - EXPIRY_MARGIN };
  return token.value;
}

async function callId(method: string, path: string, body?: unknown) {
  const url = new URL(path, ID_ISSUER);
  const headers = new Headers(body === undefined ? {} : { "content-type": "application/json" });
  const payload = body === undefined ? null : JSON.stringify(body);
  const send = async () =>
    oauth.protectedResourceRequest(await accessToken(), method, url, headers, payload, { DPoP: await dpop() });
  let response: Response;
  try {
    response = await send();
  } catch (error) {
    if (challenge(error)?.error === "invalid_token") token = null;
    else if (!oauth.isDPoPNonceError(error)) throw refusal(error);
    response = await send().catch((retryError) => {
      throw refusal(retryError);
    });
  }
  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const reason = result.error_description ?? result.error ?? "no reason";
    throw new Error(`ID refused the passport (${response.status}): ${reason}`);
  }
  return result;
}

/**
 * Creates passports in Purdue Hackers ID for these requests and returns their numbers, in the same order.
 * Each passport belongs to the member who made the request. A retry gives the same numbers again.
 */
export async function createPassports(requests: PassportRequest[]): Promise<number[]> {
  const numbers: number[] = [];
  for (const request of requests) {
    const passport = await callId("POST", "/api/passports", { owner: request.userId, reference: request.id });
    numbers.push(Number(passport.id));
  }
  return numbers;
}
