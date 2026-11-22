import type { APIRoute } from "astro";
import { finishLogin } from "../../lib/server/auth";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    return redirect(await finishLogin(url, cookies));
  } catch (error) {
    console.error("[auth] sign-in failed", error);
    return redirect("/?error=signin");
  }
};
