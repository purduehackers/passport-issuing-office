import type { APIRoute } from "astro";
import { renderDataPage } from "../../../../lib/server/render-data-page";
import { requestsById } from "../../../../lib/server/requests";
import { read } from "../../../../lib/server/storage";

/** The print-ready data page of a request, as a JPEG. A request that is not issued has no passport number yet. */
export const GET: APIRoute = async ({ params }) => {
  const [request] = params.id ? await requestsById([params.id]) : [];
  if (!request) return Response.json({ error: "There is no such request." }, { status: 404 });
  const portrait = await read(request.portraitUrl);
  if (!portrait) return Response.json({ error: "The portrait of this request is missing." }, { status: 404 });

  const image = await renderDataPage({
    fields: request,
    passportNumber: request.passportNumber ?? 0,
    issued: request.issuedAt ?? new Date(),
    portrait,
  });
  return new Response(new Uint8Array(image), {
    headers: { "content-type": "image/jpeg", "cache-control": "private, no-store" },
  });
};
