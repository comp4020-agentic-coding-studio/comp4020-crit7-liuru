# Hand-off

## comp4020-crit7-liuru: second run --- decline path added, first Fly deploy shipped

160.5h to cutoff at this run's start (not the last run per doctrine step 4),
so plan/build/deepen, not finishing steps.

Picked up the prior run's own "single most important next action": both
options it named (deepen the slice, do the first Fly deploy) turned out
worth doing in the same run, not either/or.

**Deepened:** the exceptions lifecycle was missing its other half --- a
proposal could only ever end at `confirmed`, with no way to record that a
room clash or tutor swap didn't work out and the proposal was rejected. Added
`declineException` (`src/lib/db.ts`), `POST /api/exceptions/:id/decline`
(new `src/pages/api/exceptions/[id]/decline.ts`, symmetric to the existing
confirm route), a Decline button next to Confirm on every `proposed` row
(`index.astro`), and a spec test asserting the decline persists across
reload. No migration needed --- `status` was already a free-text column, not
an enum/check constraint. Deliberately did NOT add room-clash detection
between proposals (the hand-off's other suggested deepening) --- decline was
the smaller, more clearly-in-scope gap; clash detection is a real candidate
for a future run but wasn't started this run, so there's no half-built
version of it to find.

**Shipped the first Fly deploy.** The app (`comp4020-crit7-liuru`, owned by
`comp4020-agentic-coding-studio`) already existed on Fly but had never been
deployed (`flyctl status` showed no image before this run). Ran `flyctl
deploy --remote-only --ha=false -a comp4020-crit7-liuru` after the decline
work was committed and pushed. This closes the brief's own first spec line
("the app loads at its *.fly.dev URL") which was unmet before this run ---
worth treating as similarly load-bearing as the reload-persistence line, not
a finishing-step-only action, since doctrine's deploy trigger is "once
something renders," which it already did last run.

**Verified against the live URL, not just local** (doctrine step 6): opened
`https://comp4020-crit7-liuru.fly.dev/` in `agent-browser`, confirmed
`location.href` matched before trusting anything, proposed a real exception,
declined it, reloaded, confirmed the decline persisted on the deployed
volume (proves the SQLite-on-Fly-volume setup actually works end to end, not
just in the local `.data/` file), zero console messages and zero page
errors throughout. Also checked `/readme/` live --- clean. Screenshotted both
marking viewports (1920×1080, 390×844) locally before deploying; both render
the new Confirm/Decline button pair cleanly, stacked on mobile.

`pnpm check` (typecheck + build + 31 tests, up from 30) green before commit.
Stopped the local preview server and deleted the local `.data/app.db` test
artefacts afterwards, per the routine.

Committed (`9af0c7d`) and pushed to `origin/main` before deploying, so the
deployed image matches what's on GitHub.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

Room-clash detection between proposals is the natural next deepening (warn,
at propose time, if another *confirmed* exception already claims the same
day+start+room for a different group in the same week) --- it's the other
half of "the slice that annoys you" the brief asks for, and the schema
already carries everything needed (`day`, `start`, `room` on every row) with
no migration required. Alternatively/also: re-verify the seed-data
provenance comment in `db.ts` against a fresh fetch of the course's real
`api/crit-groups.json` if enough time has passed that the published schedule
might have drifted since 2026-09-23. Whichever isn't done, don't start
`PROCESS.md`/`reflections/crit-7.md` until the run the prompt calls last ---
and when it is, remember the live URL now needs a *redeploy*, not a first
deploy, to pick up whatever that final run's own commits add.
