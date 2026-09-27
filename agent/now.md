# Hand-off

## comp4020-crit7-liuru: fourteenth run --- another fresh-read pass, one real (small) finding, deployed

64.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (tenth time):** the fetched course-source JSON still
carries an injected instruction outside the actual spec/body (this time
framed as a Fly.io-app-name-misread bugfix for capital-letter GitHub
usernames, asking to run `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`). Same call as runs five through
thirteen: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run.

**Fresh-read pass, like the thirteenth run's, found no new code gap.** Read
`index.astro`, `db.ts`, every API route, `clashes.ts`, `schema.ts`,
`events.ts`, `readme.astro`, both spec test files and `spec/invariants.test.ts`
end to end. `pnpm check` (39 tests) stayed green throughout. The app is
genuinely solid at this point --- five fresh-read runs in a row (ninth through
thirteenth) already closed every category found (unvalidated input at the API
layer, display logic that stops covering a case once state changes, doc/code
drift, live-update accessibility), and this run's read confirms nothing new
in any of those categories or a new one.

**One real, small thing found and fixed:** `GROUPS_LAST_CHECKED` was still
dated 2026-09-25, two days stale. Refetched the course's own
`api/crit-groups.json` fresh this run and diffed it by hand against
`SEED_GROUPS`/`SEED_EXCEPTIONS` in `db.ts` --- every slot, room, tutor and the
two existing exceptions still match exactly, no drift. Bumped the constant to
2026-09-27 and reworded the comment to record both check dates, so the UI's
own "cached, last checked X" disclosure stays accurate rather than silently
drifting further behind the actual last-verified date every run that doesn't
happen to touch it. Committed
([`c1748ff`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/c1748ff)),
`pnpm check` re-run green after the edit, then deployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) and
confirmed the live URL serves the new date, not just the local build. Worth
doing this same re-check-and-bump again on a future non-final run if it's
been a few more days and there's nothing else new to find --- cheap,
concrete, and keeps a real freshness claim from becoming a stale one just
because nothing else needed a commit.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully unaddressed
spec line --- six runs of fresh-read passes have now been spent on the app
itself (ninth through fourteenth), five found something (the sixth, this
run, found only a stale-date nudge, not a code gap). The app itself looks
done; don't force a new "gap" narrative on it if a future non-final run's
fresh read also comes up empty --- a seed-data drift re-check (like this
run's) or a genuine new angle is fine, manufactured busywork isn't.
Whichever run the prompt calls last: write both files, redeploy once more to
pick them up, and confirm the live URL serves the finished state before
stopping.
