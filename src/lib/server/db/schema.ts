import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const session = sqliteTable(
  "session",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    username: text("username"),
    name: text("name").notNull(),
    email: text("email"),
    picture: text("picture"),
    roles: text("roles", { mode: "json" }).$type<string[]>().notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("session_expiresAt_idx").on(table.expiresAt)],
);

export const REQUEST_STATUSES = ["pending", "exported"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const passportRequest = sqliteTable(
  "passport_request",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    username: text("username"),
    name: text("name").notNull(),
    email: text("email"),
    firstName: text("first_name").notNull(),
    surname: text("surname").notNull(),
    placeOfOrigin: text("place_of_origin").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    portraitUrl: text("portrait_url").notNull(),
    status: text("status", { enum: REQUEST_STATUSES }).default("pending").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(now).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(now).notNull(),
    exportedAt: integer("exported_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("passportRequest_status_createdAt_idx").on(table.status, table.createdAt),
    index("passportRequest_userId_idx").on(table.userId),
    // A member can have only one pending request.
    uniqueIndex("passportRequest_one_pending_per_user")
      .on(table.userId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export type PassportRequest = typeof passportRequest.$inferSelect;
