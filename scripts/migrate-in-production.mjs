// Applies database migrations during production builds on Vercel. Other builds skip this step.
import { spawnSync } from "node:child_process";

if (process.env.VERCEL_ENV !== "production") process.exit(0);
const { status } = spawnSync("drizzle-kit", ["migrate"], { stdio: "inherit", shell: true });
process.exit(status ?? 1);
