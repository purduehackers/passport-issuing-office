import type { APIRoute } from "astro";
import { requestsById } from "../../../lib/server/requests";

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];
  const requests = await requestsById(ids);
  if (!requests.length) return Response.json({ error: "Select at least one request." }, { status: 400 });

  // TODO: export is not specified yet.
  return Response.json({ error: `Export is not ready yet. ${requests.length} selected.` }, { status: 501 });
};
