import { defineMiddleware } from "astro:middleware";
import { isAdmin, readSession } from "./lib/server/auth";

const ADMIN_PATHS = /^\/(admin|api\/admin)(\/|$)/;

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  context.locals.user = await readSession(context.cookies);

  if (ADMIN_PATHS.test(context.url.pathname)) {
    const api = context.url.pathname.startsWith("/api/");
    if (!context.locals.user) {
      if (api) return Response.json({ error: "Sign in first." }, { status: 401 });
      return context.redirect(`/login?returnTo=${encodeURIComponent(context.url.pathname + context.url.search)}`);
    }
    if (!isAdmin(context.locals.user)) {
      if (api) return Response.json({ error: "Only organizers can do this." }, { status: 403 });
      return context.rewrite("/403");
    }
  }

  const response = await next();
  if (!response.headers.has("cache-control")) response.headers.set("cache-control", "private, no-store");
  return response;
});
