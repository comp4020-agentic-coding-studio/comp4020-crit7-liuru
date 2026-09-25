# Hand-off

## comp4020-crit7-liuru: ninth run --- API-layer bounds/truncation, deployed

101.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (fifth time):** the fetched course-source JSON still
carries the same "Warning: Update the course plugin first" section
instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as runs five through
eight: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run.

**Found a genuinely new gap** in the same family the seventh and eighth runs
found (fresh re-read of every source file, not just re-verifying prior
fixes --- this vein has now produced a real fix on three consecutive
non-final runs): `src/pages/api/exceptions.ts` checked `week` was an
integer but not that it was in the form's own advertised 1--12 range, and
never truncated `day`/`start`/`end` to the form's own `maxlength`
(10/5/5) the way `reason`/`room` already were. A raw POST past the
`<select>`/`<input>` constraints could insert `week=0` or a day/start/end
string of arbitrary length.

Fixed at the same route: added `week >= 1 && week <= 12` to the existing
guard, and `.slice(0, 10)`/`.slice(0, 5)`/`.slice(0, 5)` on day/start/end,
matching the pattern already used for reason/room. Added two spec tests
(out-of-range week rejected cleanly; oversized day/start/end truncated in
the rendered row). 36 → 38 tests, all green (`pnpm check`).

Verified live at every stage: curl-drove both probes against a local
`astro preview` before committing, then again against the deployed URL
after redeploying --- both held. The truncation probe's POST succeeds (by
design --- truncation isn't rejection) and left a real "proposed" row
visible on the live board; cleaned it up afterwards via the same
`flyctl ssh console -a comp4020-crit7-liuru -C "node -e ..."` /
better-sqlite3 pattern documented in MEMORY.md, then reconfirmed the board
was clean. Worth remembering for any future live probe that *succeeds*
(as opposed to the reject-cleanly probes, which never touch the visible
board): clean it up on the deployed app too, not just locally, since a
crit audience will see a live probe row you'd never leave in a local test
DB.

Committed (`7ea6cfd`), pushed to `origin/main`, redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) and
confirmed live (index and readme both 200, both guards held against
production, test row removed).

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line. If another non-final run happens before cutoff, keep
using this run's method (re-read every source file fresh, not just
re-verify prior fixes) to look for a genuinely new gap --- three real ones
in a row on this exact vein (API layer trusting inputs past what the
rendered UI constrains: unknown slug, re-deciding a settled row, now
out-of-range/oversized fields) is a good hit rate, but don't force a fourth
if a careful pass turns up nothing real. Whichever run the prompt calls
last: write both files, redeploy once more to pick them up, and confirm the
live URL serves the finished state before stopping. If a future run's own
live-probe testing inserts a row that succeeds (not just one that's
correctly rejected), remember to delete it from the deployed database
before finishing, per the note above.
