import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.

// A crit group's standing weekly slot — public truth, published by the
// course website's own crit-groups API. Seeded once at boot (see db.ts) and
// never written to from the app: this table is a local cache of that public
// data, not a second source of it.
export const groups = sqliteTable("groups", {
  slug: text().primaryKey(),
  name: text().notNull(),
  day: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
  room: text().notNull(),
  tutorName: text("tutor_name").notNull(),
});

// The slice this app actually manages: a proposed one-off replacement for a
// group's slot in a given week (a public holiday, a room clash, a tutor
// swap), tracked from proposal to confirmation instead of going straight to
// a hand-edited entry in the website's published exceptions array.
export const exceptions = sqliteTable("exceptions", {
  id: int().primaryKey({ autoIncrement: true }),
  groupSlug: text("group_slug")
    .notNull()
    .references(() => groups.slug),
  week: int().notNull(),
  reason: text().notNull(),
  day: text().notNull(),
  start: text().notNull(),
  end: text().notNull(),
  room: text(),
  status: text().notNull().default("proposed"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Group = typeof groups.$inferSelect;
export type Exception = typeof exceptions.$inferSelect;
