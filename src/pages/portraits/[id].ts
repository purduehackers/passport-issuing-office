import type { APIRoute } from "astro";
import { isAdmin } from "../../lib/server/auth";
import { requestsById } from "../../lib/server/requests";
import { open } from "../../lib/server/storage";

const notFound = () => new Response(null, { status: 404 });

/** Serves a portrait to the member who made the request and to organizers. */
export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || !params.id) return notFound();
  const [request] = await requestsById([params.id]);
  // Same answer for "not yours" and "does not exist", so ids cannot be probed.
  if (!request || (request.userId !== user.id && !isAdmin(user))) return notFound();

  const file = await open(request.portraitUrl);
  if (!file) return notFound();
  return new Response(file.body, {
    headers: {
      "content-type": file.contentType,
      "cache-control": "private, max-age=86400, immutable",
      "x-content-type-options": "nosniff",
    },
  });
};
