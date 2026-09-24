# Hand-off

## comp4020-crit7-liuru: fourth run --- clash warnings now live over SSE, redeployed

142.5h to cutoff at this run's start, well short of "last run" --- plan/build/
deepen (doctrine step 4), not finishing steps.

Picked up the prior hand-off's candidate (a): the SSE live-update path only
patched the one row named in each event, so a clash warning (added the
previous run) wouldn't appear or clear until a full reload if the clash
depended on *another* row changing. Fixed properly rather than patching
around it.

**Built:** every write route (`exceptions.ts`, `exceptions/[id]/confirm.ts`,
`exceptions/[id]/decline.ts`) now calls `bus.emit("exceptions",
listExceptions())` --- the whole table, not the one changed row.
`api/events.ts` streams that whole array as one SSE message. `index.astro`'s
client script now imports the actual `findClash` from `src/lib/clashes.ts`
(a pure function, `import type`-only deps, so Astro's script bundler ships
it to the browser with none of the server-only `better-sqlite3` code) and
rebuilds the entire `<ul>` from scratch on every message, using DOM
`createElement`/`textContent` (never `innerHTML` with interpolated
strings --- `reason` is free-text user input, so string-templated HTML would
be an XSS hole). Groups data (static, read-only cache) rides along as a
`data-groups` JSON attribute on `<ul>`, escaped by Astro automatically, so
the client doesn't need a second route to fetch it.

**Verified in a real browser against the live app**, not just locally:
opened the deployed page once, left that tab alone, then drove the whole
propose → confirm → colliding-propose sequence via `curl` from outside the
browser (so the open tab's own actions couldn't be the thing making it
right) and confirmed the clash warning appeared in the untouched tab's DOM
with zero reload, zero console messages, zero page errors. Also confirmed a
dynamically-rebuilt row's Confirm/Decline `<form>` still actually submits
(a real click via `agent-browser eval` on the constructed form, not just
that the DOM shape looked right) --- the redirect and persisted status both
checked out. `pnpm check` green: still 32 tests (no new test added this run
--- the existing clash-warning integration test already covers the
*contract*, "a proposal that clashes shows the warning"; this deepening
changed the delivery mechanism, not the contract, so no test was owed one
--- worth a second look if a future run can find a way to assert the
*without-reload* property itself, e.g. hitting `/api/events` directly and
checking a second message's payload reflects a change made after the first
was read).

**Cleaned up both environments' test data afterwards:** locally, the
`.data/app.db` used for local browser testing was untracked and disposable,
just `rm -rf .data`. On the live volume, the test created a `confirmed` row
again (same tradeoff the prior run named --- no in-app undo, and a stray
confirmed row is indistinguishable from real state) plus a `proposed` one;
deleted both directly via `flyctl ssh console` + the app's own
`better-sqlite3`, confirmed via a live reload that the board is back to
exactly its pre-test three rows (the two real Labour Day exceptions plus a
prior run's own harmless `declined` verification row, left alone since it's
not this run's artefact to clean up).

Committed (`96ced6e`) and pushed to `origin/main`, then redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`).

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line ("you can account for how you directed, grounded and
corrected the work") --- correctly deferred until the run the prompt calls
last, which this one wasn't (142.5h is nowhere close). Candidate deepenings
if there's another non-final run first, from the prior hand-off's list,
option (a) now done:
(b) a "my slots" filter/view scoped to one group --- the board still shows
every group's proposals mixed together with no way to see just one group's
own history. Might also be worth reconsidering the seed-data provenance
re-check (last done at the very first run, dated 2026-09-23 in `db.ts`'s own
comment) --- it's now been about a day and a half since that fetch, likely
still not enough drift to be worth it, but the gap is growing each run.
Whichever isn't done, don't start the finishing-step files until the run
the prompt calls last --- and remember the live URL needs one more redeploy
on that run to pick up whatever it adds, including the two new files
themselves.
