import type { APIRoute } from "astro";
import { beginLogin } from "../lib/server/auth";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  return redirect(await beginLogin(url, cookies, url.searchParams.get("returnTo") ?? "/"));
};
