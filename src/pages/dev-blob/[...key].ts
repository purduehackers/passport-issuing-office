import type { APIRoute } from "astro";
import { readLocal } from "../../lib/server/storage";

export const GET: APIRoute = async ({ params }) => {
  if (!import.meta.env.DEV || !params.key) return new Response(null, { status: 404 });
  try {
    return new Response(await readLocal(params.key), { headers: { "content-type": "image/jpeg" } });
  } catch {
    return new Response(null, { status: 404 });
  }
};
