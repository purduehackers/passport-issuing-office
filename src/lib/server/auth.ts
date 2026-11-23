import type { AstroCookies } from "astro";
import { and, eq, gt, lt } from "drizzle-orm";
import * as oauth from "oauth4webapi";
import { ID_CLIENT_ID, ID_CLIENT_SECRET, ID_ISSUER } from "astro:env/server";
import { db } from "./db";
import { session } from "./db/schema";

export const SCOPES = "openid profile email roles";
export const ADMIN_ROLE = "organizer";

const SESSION_COOKIE = "pio_session";
const LOGIN_COOKIE = "pio_login";
const SESSION_TTL = 24 * 60 * 60_000;
const LOGIN_TTL = 10 * 60;

export type User = {
  id: string;
  username: string | null;
  name: string;
  email: string | null;
  picture: string | null;
  roles: string[];
};

export const isAdmin = (user: User | null | undefined) => !!user?.roles.includes(ADMIN_ROLE);

export const client: oauth.Client = { client_id: ID_CLIENT_ID };
export const clientAuth = oauth.ClientSecretBasic(ID_CLIENT_SECRET);
const issuer = new URL(ID_ISSUER);

let discovery: Promise<oauth.AuthorizationServer> | null = null;
export function authorizationServer() {
  discovery ??= oauth
    .discoveryRequest(issuer, { algorithm: "oidc" })
    .then((response) => oauth.processDiscoveryResponse(issuer, response))
    .catch((error) => {
      discovery = null;
      throw error;
    });
  return discovery;
}

const cookieOptions = (url: URL) => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: url.protocol === "https:",
});

const sha256 = async (value: string) =>
  Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))).toString("hex");

const redirectUri = (url: URL) => new URL("/auth/callback", url.origin).href;

/** Only same-site paths, so a crafted link cannot send users to another site. */
export function safeReturnTo(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

type PendingLogin = { state: string; nonce: string; verifier: string; returnTo: string };

export async function beginLogin(url: URL, cookies: AstroCookies, returnTo: string) {
  const as = await authorizationServer();
  const pending: PendingLogin = {
    state: oauth.generateRandomState(),
    nonce: oauth.generateRandomNonce(),
    verifier: oauth.generateRandomCodeVerifier(),
    returnTo: safeReturnTo(returnTo),
  };
  cookies.set(LOGIN_COOKIE, JSON.stringify(pending), { ...cookieOptions(url), maxAge: LOGIN_TTL });

  const target = new URL(as.authorization_endpoint!);
  target.search = new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: redirectUri(url),
    response_type: "code",
    scope: SCOPES,
    state: pending.state,
    nonce: pending.nonce,
    code_challenge: await oauth.calculatePKCECodeChallenge(pending.verifier),
    code_challenge_method: "S256",
  }).toString();
  return target.href;
}

export async function finishLogin(url: URL, cookies: AstroCookies) {
  const raw = cookies.get(LOGIN_COOKIE)?.value;
  cookies.delete(LOGIN_COOKIE, { path: "/" });
  if (!raw) throw new Error("The sign-in expired. Try again.");
  const pending = JSON.parse(raw) as PendingLogin;

  const as = await authorizationServer();
  const params = oauth.validateAuthResponse(as, client, url, pending.state);
  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
    redirectUri(url),
    pending.verifier,
  );
  const result = await oauth.processAuthorizationCodeResponse(as, client, response, {
    expectedNonce: pending.nonce,
    requireIdToken: true,
  });
  const claims = oauth.getValidatedIdTokenClaims(result)!;

  const info = await oauth.userInfoRequest(as, client, result.access_token);
  const profile = await oauth.processUserInfoResponse(as, client, claims.sub, info);

  const user: User = {
    id: claims.sub,
    username: str(profile.preferred_username ?? claims.preferred_username),
    name: str(profile.name) ?? str(claims.name) ?? str(profile.preferred_username) ?? "Hacker",
    email: str(profile.email ?? claims.email),
    picture: str(profile.picture),
    roles: strings(profile.roles ?? claims.roles),
  };
  await createSession(url, cookies, user);
  return pending.returnTo;
}

const str = (value: unknown) => (typeof value === "string" && value ? value : null);
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

async function createSession(url: URL, cookies: AstroCookies, user: User) {
  const now = Date.now();
  await db.delete(session).where(lt(session.expiresAt, new Date(now)));

  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const expiresAt = new Date(now + SESSION_TTL);
  await db.insert(session).values({ tokenHash: await sha256(token), userId: user.id, ...withoutId(user), expiresAt });
  cookies.set(SESSION_COOKIE, token, { ...cookieOptions(url), expires: expiresAt });
}

const withoutId = ({ id: _, ...rest }: User) => rest;

export async function readSession(cookies: AstroCookies): Promise<User | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select()
    .from(session)
    .where(and(eq(session.tokenHash, await sha256(token)), gt(session.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  return {
    id: row.userId,
    username: row.username,
    name: row.name,
    email: row.email,
    picture: row.picture,
    roles: row.roles,
  };
}

export async function endSession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(session).where(eq(session.tokenHash, await sha256(token)));
  cookies.delete(SESSION_COOKIE, { path: "/" });
}
