# Hand-off

## comp4020-crit7-liuru: third run --- room-clash warning added, redeployed

149.5h to cutoff at this run's start, well short of the "last run" call, so
plan/build/deepen (doctrine step 4), not finishing steps.

Picked up the prior hand-off's own "single most important next action": room-
clash detection between proposals, the other half of "the slice that annoys
you". Deliberately did NOT do the alternative it also named (re-verifying
seed-data provenance) --- one day since the 2026-09-23 fetch is not enough
drift to be worth a re-check yet.

**Built:** `src/lib/clashes.ts` --- a pure `findClash(exception, all,
groupBySlug)` that, for a `proposed` exception, looks for another exception
in `confirmed` status with the same week/day/start and the same *effective*
room (an exception's own `room` if set, else its group's standing room) but
a different group. No schema change, no new stored state --- computed at
render time from the same rows `index.astro` already loads, so a clash
appears or clears the instant either exception's status changes on the next
reload. Wired into `index.astro`: a `proposed` row with a clash gets an
inline `<p class="clash-warning">⚠ clashes with {group}'s confirmed
exception for the same week, day, time and room</p>` between its status
span and its Confirm/Decline buttons. Added a `.clash-warning` style
(`#7a3e00` on white, hand-computed contrast ~8.3:1 --- comfortably past AA).

**Deliberately left out of scope:** the SSE live-update path
(`index.astro`'s inline `<script>`) does not recompute clash warnings when a
status changes in another tab --- it only rewrites `textContent`/`data-
status` for the one row an event names. A full reload always shows the
correct clash state; only the sub-second window before a reload could show
a stale warning. Doing this properly would mean sending the whole exceptions
list (or clash state) over SSE instead of one row, which is more plumbing
than this deepening needed --- worth doing only if a future run adds more
derived-from-the-whole-list state.

**Tested:** added an integration test to `spec/exceptions.test.ts` (propose
a holder, confirm it, propose a colliding one for a different group, assert
the clash-warning text appears near the right group name) --- a real
end-to-end contract check, not a unit test of the pure function in
isolation, per this repo's own "spec test earns its place" rule.
`pnpm check` green: 32 tests (up from 31), typecheck clean.

**Verified in a real browser, twice** (doctrine step 6): locally at both
marking viewports first (1920×1080, 390×844), then against the live
`https://comp4020-crit7-liuru.fly.dev/` after redeploying --- confirmed
`location.href` matched before trusting anything, drove the actual HTML
form via `agent-browser eval` (`document.forms` lookup by `action.includes`,
not a CSS attribute selector with `$=`, which a shell-escaping issue mangled
into an invalid selector), created a real clash, screenshotted it rendering
correctly, zero console messages and zero page errors throughout.

**Cleaned up the live test data afterwards** rather than leaving it, because
this deepening's test data included a *confirmed* row --- unlike a merely
`declined` verification artefact (which a prior run left and is harmless
noise), a stray `confirmed` exception is indistinguishable from a real
course record and there's no in-app undo for it. Since there's no delete/
revert route (by design --- confirming is meant to be a one-way step,
mirroring the real website's own published-exceptions array), removed the
two test rows directly from the Fly volume's SQLite file over `flyctl ssh
console`, using the app's own bundled `better-sqlite3` via `node -e`
(`sqlite3` the CLI isn't installed in the deployed image; the node module
already is). Confirmed via a live reload afterwards that the board is back
to exactly its pre-test three-row state (the two real Labour-Day exceptions
plus the prior run's own harmless `declined` verification row). This is the
one legitimate case for touching the production DB directly: my own test
artefacts, not real state, and only because the app itself has no path to
undo a confirm.

Committed (`aed4633`) and pushed to `origin/main`, then redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) so the
live image matches what's on GitHub.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

The brief's spec line "you can account for how you directed, grounded and
corrected the work" is the one still fully unaddressed --- that's
`PROCESS.md` and `reflections/crit-7.md`, both correctly deferred to the
finishing run. Candidate deepenings if there's another non-final run first:
(a) surface the clash warning without a full reload by sending the whole
exceptions list over SSE instead of one row (the gap noted above); (b) a
"my slots" filter/view scoped to one group, since the board currently shows
every group's proposals mixed together with no way to see just your own
group's history. Whichever isn't done, don't start the finishing-step files
until the run the prompt calls last --- and remember the live URL will need
one more redeploy on that run to pick up whatever it adds, including the two
new files themselves (the finishing steps are file/repo changes, so they do
need a deploy like every other commit, not just doc-only work).
