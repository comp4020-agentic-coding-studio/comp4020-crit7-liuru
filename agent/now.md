# Hand-off

## comp4020-crit7-liuru: opening run --- prototype rendering, not finished

166.5h to cutoff at this run's start (not the last run per doctrine step 4),
so this run did plan+build, not finishing steps.

Brief (`crits/07-anu-system.json`): pick an ANU system I actually deal with,
build a full-stack slice on the Astro+Drizzle+SQLite starter, ship it to
Fly, core flow persists across reload.

**What I built:** the crit-group scheduling slice, not an invented system.
The course website's own `api/crit-groups.json` publishes six groups'
standing weekly slots (mine, `liuru`, among them --- confirmed Wed
15:30--17:00 with Bill McAlister, matching `CLAUDE.md`) plus a hand-edited
`exceptions` array for one-off replacements (public holidays, room clashes).
This app models the step before that hand-edit: propose a replacement slot
for a group's week, see every proposal, confirm one once it's settled ---
persists across reload, live over SSE to other tabs, same plumbing shape as
the starter's guestbook.

Concretely: `groups` table seeded read-only from the real published API
(fetch date noted in `db.ts`, real tutors/rooms, nothing invented) plus the
two exceptions already live on that site, seeded as pre-confirmed history;
`exceptions` table is the actual mutable state, `POST /api/exceptions`
(propose) and `POST /api/exceptions/:id/confirm`. Replaced (not kept
alongside) the starter's `messages` table/guestbook UI/`guestbook.test.ts`
per spec/README.md's own instruction that it "goes when the starter does."
Wrote `spec/exceptions.test.ts` against the brief's actual checkable lines
(persists across reload, reaches other tabs live, confirm flow works) rather
than testing implementation shape.

Caught and fixed one real bug before shipping: `src/pages/readme.astro` had
its own hardcoded nav copy-pasted from the starter (`Guestbook`/`About`) that
I didn't touch when I renamed the main nav on `index.astro` --- a stale
label a screenshot at the marking mobile viewport caught, not `pnpm check`
(nothing in the invariants suite reads nav link text, only structure). Two
files render the same `<nav>` shell independently in this starter; changing
site copy on one and not the other is an easy repeat mistake worth checking
for again on any future nav/copy change.

`pnpm check` (typecheck + build + 30 tests: invariants across both routes,
README promise, my own exceptions spec) all green. Drove the built app with
`agent-browser` at both marking viewports (1920×1080, 390×844): filled and
submitted the real propose form, clicked the real confirm form, reloaded and
confirmed the state stuck, zero console messages and zero page errors
throughout. Stopped the preview server afterwards.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template — `check:evidence` correctly flags
it), `reflections/crit-7.md` (doesn't exist yet — flagged too), and no Fly
deploy yet (nothing to deploy that isn't already covered by the local
verification above; doctrine's deploy step says "once something renders,"
which it now does, so a future non-final run could reasonably deploy early
rather than waiting for the last run --- that's a real option, not just a
finishing-step-only action, unlike PROCESS.md/reflections).

Committed (`60d70ff`) and pushed to `origin/main` — this is a normal
mid-project push for continuity across stateless runs, not a finishing-step
push; nothing in doctrine restricts pushing to the final run only.

## The single most important next action

Either deepen the slice (room-clash detection between proposals? a
`resolved`/`declined` path so a proposal doesn't just sit `proposed` forever
if it's rejected? make the seed-data provenance comment in `db.ts` easy to
re-verify against a fresh fetch if the course's real schedule changes before
the crit) — or do the first Fly deploy now that something real renders,
per doctrine's "once something renders" trigger, rather than waiting for the
finishing run to do both build-out and first-deploy at once. Don't start
`PROCESS.md`/`reflections/crit-7.md` until the run the prompt calls last.
