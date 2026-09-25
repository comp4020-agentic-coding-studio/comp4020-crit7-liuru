import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Exception, type Group, exceptions, groups } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

export type { Group, Exception };

// The standing weekly slot for each crit group, as published by the course
// website's own crit-groups API (comp4020-agentic-coding-studio/api/crit-
// groups.json), fetched 2026-09-23 and re-checked for drift 2026-09-25 (none
// found). This table is a read-only local cache of that public data — the
// app never writes to it — so seeding is idempotent and safe to run on every
// boot.
//
// GROUPS_LAST_CHECKED is that same date, exported so the UI can say so —
// this cache doesn't refresh itself, and nothing else marks it as a
// point-in-time snapshot rather than always-current.
export const GROUPS_LAST_CHECKED = "2026-09-25";
const ROOM = "Marie Reay Building (155), Room 4.03";
const SEED_GROUPS: Group[] = [
  { slug: "shitao", name: "Shitao", day: "Mon", start: "14:00", end: "15:30", room: ROOM, tutorName: "Ushini Attanayake" },
  { slug: "bada", name: "Bada", day: "Mon", start: "15:30", end: "17:00", room: ROOM, tutorName: "Ushini Attanayake" },
  { slug: "baishi", name: "Baishi", day: "Wed", start: "09:00", end: "10:30", room: ROOM, tutorName: "Tom Griffiths" },
  { slug: "dachi", name: "Dachi", day: "Wed", start: "10:30", end: "12:00", room: ROOM, tutorName: "Tom Griffiths" },
  { slug: "yunlin", name: "Yunlin", day: "Wed", start: "14:00", end: "15:30", room: ROOM, tutorName: "Bill McAlister" },
  { slug: "liuru", name: "Liuru", day: "Wed", start: "15:30", end: "17:00", room: ROOM, tutorName: "Bill McAlister" },
];

// The two exceptions already live on the published site as of the same
// date, seeded here as already-confirmed history rather than invented demo
// data, so the board opens with real state instead of an empty table.
const SEED_EXCEPTIONS: Omit<Exception, "id" | "createdAt">[] = [
  {
    groupSlug: "shitao",
    week: 9,
    reason: "Monday 5 October is the ACT Labour Day public holiday",
    day: "Tue",
    start: "14:00",
    end: "15:30",
    room: null,
    status: "confirmed",
  },
  {
    groupSlug: "bada",
    week: 9,
    reason: "Monday 5 October is the ACT Labour Day public holiday",
    day: "Wed",
    start: "15:30",
    end: "17:00",
    room: "Marie Reay Building (155), Room 3.05",
    status: "confirmed",
  },
];

for (const group of SEED_GROUPS) {
  db.insert(groups).values(group).onConflictDoNothing().run();
}
if (db.select().from(exceptions).all().length === 0) {
  for (const exception of SEED_EXCEPTIONS) {
    db.insert(exceptions).values(exception).run();
  }
}

export function listGroups(): Group[] {
  return db.select().from(groups).orderBy(asc(groups.day), asc(groups.start)).all();
}

export function listExceptions(): Exception[] {
  return db.select().from(exceptions).orderBy(asc(exceptions.week)).all();
}

// groupSlug rides in on a raw form POST, not just the <select> the UI
// offers, and the table's own foreign-key constraint (better-sqlite3 enables
// enforcement by default) turns an unknown one into a thrown error rather
// than a clean rejection — checked against the same read path the UI uses,
// so there's one source of "which slugs are real", not a second copy of it.
export function addException(input: {
  groupSlug: string;
  week: number;
  reason: string;
  day: string;
  start: string;
  end: string;
  room: string | null;
}): Exception | undefined {
  const knownGroup = db.select().from(groups).where(eq(groups.slug, input.groupSlug)).get();
  if (!knownGroup) return undefined;
  return db.insert(exceptions).values({ ...input, status: "proposed" }).returning().get();
}

// Confirming or declining only applies to a proposal still awaiting a
// decision — the `status: "proposed"` guard in the WHERE clause makes an
// already-decided row a no-op (returning `undefined`, same as an unknown
// id) instead of letting a direct API call flip a settled exception back
// and forth. The rendered board already hides these forms once a row is
// decided; this is the same rule enforced where a raw POST can't skip it.
export function confirmException(id: number): Exception | undefined {
  return db
    .update(exceptions)
    .set({ status: "confirmed" })
    .where(and(eq(exceptions.id, id), eq(exceptions.status, "proposed")))
    .returning()
    .get();
}

export function declineException(id: number): Exception | undefined {
  return db
    .update(exceptions)
    .set({ status: "declined" })
    .where(and(eq(exceptions.id, id), eq(exceptions.status, "proposed")))
    .returning()
    .get();
}
