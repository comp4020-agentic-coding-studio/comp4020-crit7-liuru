# Hand-off

## comp4020-crit7-liuru: eleventh run --- fixed a stale README claim, deployed

88.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (seventh time):** the fetched course-source JSON
still carries the same "Warning: Update the course plugin first" section
instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as runs five through
ten: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run.

**Fresh-read pass found a genuine gap, in a new vein again:** not app logic
this time but doc/implementation drift. `README.md`'s scope note said the
app "doesn't detect room clashes between proposals" --- true when first
written, false since `aed4633` (three runs ago) added `findClash` and two
runs' worth of clash-warning refinement since. A reader following
`README.md`'s own claims (which is exactly what a marker does, per
`PROCESS.md`'s own framing: "markers read this file... they don't trawl the
repo") would be told a real, tested feature doesn't exist. Fixed: removed
the false claim, added an accurate bullet to "what good looks like here"
describing what the clash warning actually does and pointing at
`src/lib/clashes.ts` and the clash tests. Worth remembering as its own
category for future fresh-read passes: check `README.md`'s scope claims
against current `git log`/source, not just the source files against each
other --- doc drift is invisible to `pnpm check` (nothing asserts
`README.md`'s prose is *true*, only that `/readme/` serves the whole file
verbatim) and easy to miss when every prior pass has been hunting for gaps
in application code specifically.

39 tests still green (`pnpm check`, unaffected --- this was a docs-only
change). Verified locally in a real browser first (`agent-browser` against
the built server: index and `/readme/` both load, no console/page errors,
`/readme/` visibly carries the new text) before committing. Committed
(`3b1ca32`), pushed to `origin/main`, redeployed (`flyctl deploy
--remote-only --ha=false -a comp4020-crit7-liuru`), confirmed the live URL
serves the fix (`/readme/` contains "double-book a room", no longer
contains "doesn't detect room clashes"). No database state touched this
run, so no cleanup needed on the deployed volume.

Deliberately NOT done this run, because doctrine gates them to the
finishing run: `PROCESS.md` (still the template), `reflections/crit-7.md`
(doesn't exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line. If another non-final run happens before cutoff,
keep doing a fresh read of every source file (not just re-verifying prior
fixes) --- three runs running have each found a genuinely new gap in a
different vein (unvalidated input at the API layer; display logic that
stops covering a case once state changes underneath it; now doc/code
drift), so there may be real value left to find. Don't force one if a
careful pass turns up nothing real, though: two of the last eleven runs
(the eighth's own hand-off, and this run implicitly by contrast) show the
search sometimes comes up empty and that's fine. Whichever run the prompt
calls last: write both files, redeploy once more to pick them up, and
confirm the live URL serves the finished state before stopping.
