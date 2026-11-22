// @ts-check
import { defineConfig, envField } from "astro/config";

import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),

  env: {
    schema: {
      ID_ISSUER: envField.string({
        context: "server",
        access: "public",
        default: "https://id.purduehackers.com/api/auth",
      }),
      ID_CLIENT_ID: envField.string({ context: "server", access: "secret" }),
      ID_CLIENT_SECRET: envField.string({ context: "server", access: "secret" }),
      TURSO_DATABASE_URL: envField.string({
        context: "server",
        access: "secret",
        default: "file:local.db",
      }),
      TURSO_AUTH_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      BLOB_READ_WRITE_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
