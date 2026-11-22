import type { APIRoute } from "astro";
import { endSession } from "../lib/server/auth";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await endSession(cookies);
  return redirect("/");
};
