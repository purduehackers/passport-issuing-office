import type { APIRoute } from "astro";
import { RequestError, submitRequest, withdrawRequest } from "../../lib/server/requests";

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return Response.json({ error: "Sign in first." }, { status: 401 });
  try {
    await submitRequest(locals.user, await request.formData());
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message, fields: error.fields }, { status: 400 });
    }
    console.error("[request] submit failed", error);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ locals }) => {
  if (!locals.user) return Response.json({ error: "Sign in first." }, { status: 401 });
  await withdrawRequest(locals.user.id);
  return Response.json({ ok: true });
};
