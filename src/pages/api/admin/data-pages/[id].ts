import type { APIRoute } from "astro";
import { renderDataPage } from "../../../../lib/server/render-data-page";
import { requestsById } from "../../../../lib/server/requests";
import { read } from "../../../../lib/server/storage";

/** The print-ready data page of an issued passport, as a JPEG. */
export const GET: APIRoute = async ({ params }) => {
  const [request] = params.id ? await requestsById([params.id]) : [];
  if (!request) return Response.json({ error: "There is no such request." }, { status: 404 });
  if (request.passportNumber === null) {
    return Response.json({ error: "Issue this passport first, so it has a number." }, { status: 409 });
  }
  const portrait = await read(request.portraitUrl);
  if (!portrait) return Response.json({ error: "The portrait of this request is missing." }, { status: 404 });

  const image = await renderDataPage({
    fields: request,
    passportNumber: request.passportNumber,
    issued: request.issuedAt ?? new Date(),
    portrait,
  });
  return new Response(new Uint8Array(image), {
    headers: { "content-type": "image/jpeg", "cache-control": "private, no-store" },
  });
};
