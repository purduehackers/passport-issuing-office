import type { APIRoute } from "astro";
import { issuePassports } from "../../../lib/server/requests";

/** Issues passports for the selected requests. The browser then builds the print files. */
export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];
  if (!ids.length) return Response.json({ error: "Select at least one request." }, { status: 400 });

  let passports;
  try {
    passports = await issuePassports(ids);
  } catch (error) {
    console.error("[issue] failed", error);
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
  if (!passports.length) return Response.json({ error: "None of the selected requests exist." }, { status: 404 });
  return Response.json({ passports });
};
