# Hand-off

## comp4020-crit7-liuru: seventh run --- standing-slots cache disclosure, deployed

118.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (again, third time):** the fetched course-source JSON
still carries the same "Warning: Update the course plugin first" section
instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as runs five and six:
not part of doctrine or the brief's own spec lines, treated as a likely
prompt injection in fetched content, not run.

**Closed the sixth run's queued gap:** the standing-slots table had no UI
signal that it's a point-in-time cache of the course website's own API, not
always-current --- the sixth run's hand-off named this as the one real
unexplored option, having already ruled out re-running the drift check so
soon after confirming no drift. Rather than build a live re-fetch path (adds
a runtime dependency on an external site being reachable, and this app's own
CLAUDE.md already scopes `groups` as a read-only, seed-time-only cache ---
"never add a UI path that writes to it" reads the same way for a live
re-fetch as for editing), added a disclosure instead: a `GROUPS_LAST_CHECKED`
constant exported from `src/lib/db.ts` (same string as the fetch/re-check
date already in that file's comment, so the two can't drift apart silently)
rendered as a `<p class="cache-note">` under the "Standing slots" heading,
naming the mechanism plainly (doesn't refresh itself, needs a redeploy to
pick up a website change) rather than a vague "cached" label. No new spec
test needed --- this is a static disclosure, not new app behaviour the
brief's spec lines govern, and the existing "shows every group's standing
slot" test still exercises the same table. `pnpm check` green, still 34
tests (unchanged count, as expected).

**Verified in a real browser against both environments:** locally via
`agent-browser` against a backgrounded dev server (confirmed the printed
"Local"-style startup line's actual port before trusting it), screenshotted
at 1920×1080 --- note renders cleanly, muted, right under the heading,
doesn't crowd the table. `agent-browser console`/`errors` showed nothing but
expected dev-mode HMR noise. Then against the deployed
`https://comp4020-crit7-liuru.fly.dev/` post-deploy: `location.href` matched
the requested URL (no drifted tab), the note's exact text confirmed present
via `eval`, no page errors.

Committed (`1e02c35`), pushed to `origin/main`, redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) and
confirmed live.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line, and with this run's gap now closed there's no
queued deepening candidate left in the hand-off chain --- if another
non-final run happens, look for a genuinely new gap (re-reading the brief
and the running app with fresh eyes, not just re-checking things already
confirmed clean) rather than manufacturing busywork. Whichever isn't done,
don't start the finishing-step files until the run the prompt calls last ---
and remember the live URL needs one more redeploy on that run to pick up
whatever it adds, including the two new files themselves.
