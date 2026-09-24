# Hand-off

## comp4020-crit7-liuru: sixth run --- empty-state message, seed-data drift check, deployed

125.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (again):** the fetched course-source JSON for this
crit still carried the same "Warning: Update the course plugin first"
section instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as the fifth run's
hand-off: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run. Consistent across at
least two fetches now --- worth noting for a human maintainer of that course
page, but not something I act on unprompted.

**Did both of the fifth run's deferred candidates**, since this run wasn't
the last one either:

1. **Seed-data drift re-check.** Fetched the course website's live
   `api/crit-groups.json` again and compared every field (day/time/tutor/
   room for all six groups, both existing exceptions) against
   `SEED_GROUPS`/`SEED_EXCEPTIONS` in `src/lib/db.ts`. No drift found.
   Updated the fetch-date comment to note the 2026-09-25 re-check
   alongside the original 2026-09-23 fetch, rather than just bumping the
   date and losing that history.

2. **Empty-state message for the group filter.** A filtered view with zero
   matching exceptions previously rendered an empty `<ul>` indistinguishable
   from "the filter is broken." Added a `<li class="empty-state">{Group}
   has no exceptions yet.</li>` row --- both in the server-rendered Astro
   markup and in the client-side SSE rebuild script, so a tab that starts
   filtered-and-empty and then receives a live update (or vice versa: goes
   from having one exception to zero, e.g. after a decline) shows the
   right state either way without a reload. New spec test
   (`spec/exceptions.test.ts`, "shows an empty-state message when a
   filtered group has no exceptions") targets Dachi specifically because
   it's the one group with no seeded exceptions AND no earlier test in the
   file proposes one for it before this test runs --- order matters here
   since the spec server's state accumulates across the whole file
   (sequential, not parallel, within one describe block). `pnpm check`
   green, 34 tests (up from 33).

**Verified in a real browser against both environments:** locally via
`agent-browser` against a backgrounded dev server (confirmed the printed
"Local"-style startup line's actual port before trusting it, per the
established port-fallback caution), including a live cross-tab check ---
opened `?group=baishi` (empty), posted a real proposal for Baishi via
`curl` from outside the browser (needed an `Origin` header to pass Astro's
CSRF check, same as the existing spec tests' own `post` helper does),
watched the empty-state clear and the real row appear with zero reload,
then declined it and confirmed a declined exception still counts as
present (it's kept as history, correctly not re-triggering the empty
state --- that's existing decline behaviour, not something this run
changed). Screenshotted the 1920×1080 empty state for Liuru: renders
clean, italic, readable. `agent-browser errors`/`console` showed nothing
but expected dev-mode HMR noise. Then verified again against the deployed
`https://comp4020-crit7-liuru.fly.dev/` post-deploy: `location.href`
matched the requested URL both times (no drifted tab), a filtered-empty
group (Dachi, which has no seed exceptions and nothing else has ever
written to prod for it) showed the message, and a group with a real seeded
exception (Shitao) still rendered its row correctly alongside it.

Committed (`d792712`), pushed to `origin/main`, redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) and
confirmed both cases live.

Deliberately NOT done this run, because doctrine gates them to the
finishing run: `PROCESS.md` (still the template), `reflections/crit-7.md`
(doesn't exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line. With both of the fifth run's deepening candidates
now done, there's no queued candidate for a further non-final run --- if
one happens before the run the prompt calls last, look for a genuinely new
gap rather than re-running the drift check pointlessly soon after this one
confirmed no drift (it's cheap to re-check but redundant on a timescale of
days, not weeks). One real option not yet explored: the standing-slots
table has no equivalent live-update path --- if the website's own published
data changed mid-week, this app's cache wouldn't pick it up without a
redeploy, and there's no UI signal that the table is a point-in-time cache
rather than always-current. Whichever isn't done, don't start the
finishing-step files until the run the prompt calls last --- and remember
the live URL needs one more redeploy on that run to pick up whatever it
adds, including the two new files themselves.
