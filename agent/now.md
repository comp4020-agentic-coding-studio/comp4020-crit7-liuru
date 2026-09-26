# Hand-off

## comp4020-crit7-liuru: tenth run --- clash warning stays visible after both sides confirm, deployed

94.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (sixth time):** the fetched course-source JSON still
carries the same "Warning: Update the course plugin first" section
instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as runs five through
nine: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run.

**Found a genuinely new gap**, but in a different vein from the three prior
runs' "API layer trusting inputs past the form" family: `src/pages/index.astro`
only ever computed `findClash` for a row with `status === "proposed"`, both
server-side and in the client's SSE re-render script. Two independently-
proposed exceptions colliding on room/day/time/week correctly show a warning
while at least one side is still proposed --- but the moment BOTH get
confirmed (plausible exactly because the whole point of this board is
independent tutors acting from separate tabs), the warning vanishes from
both rows and the double-booking becomes permanently invisible. Fixed by
checking `status !== "declined"` instead of `=== "proposed"` in both the
astro render and the client script (confirm/decline buttons still gated to
`=== "proposed"` only). Added a spec test for the both-confirmed case.

**A genuine test-writing trap, worth remembering for any future row-scoped
regex against this rendered list:** my first version of that new test used
`id="exception-(\d+)"[\s\S]{0,400}?REASON` to find a row's id --- non-greedy
but *not* bounded by `</li>`, so it can walk straight past the end of one
`<li>` into a sibling's content if the reason text of a DIFFERENT row falls
within the same 400-char window (exactly what happens when two clashing
rows render back-to-back, which is precisely the scenario this test needed
to build). That silently confirmed the wrong exception id and made the test
fail even though the app fix was already correct --- caught only by
isolating the failing test with `vitest run -t`, then a temporary
`console.error` dump of the actual rendered `<ul>`, then confirming the same
scenario worked via raw `curl` against `node dist/server/entry.mjs`
directly (proving the app logic, not the test, was fine). Fixed the test
with a lookahead-bounded pattern: `<li id="exception-(\d+)"(?:(?!</li>)
[\s\S])*?REASON(?:(?!</li>)[\s\S])*?</li>` --- guarantees the id and the
reason text are in the *same* list item by never crossing a `</li>` while
scanning. Existing tests in the file use the looser, unbounded pattern too;
none of them have tripped over it yet because their tagged rows don't
currently land within 400 chars of an unrelated row's matching text, but the
same trap is latent there. Worth the bounded pattern as the default for any
*new* test in this file that creates more than one tagged row, rather than
copying the older unbounded style.

39 tests green (`pnpm check`). Committed (`9d66e8c`), pushed to
`origin/main`, redeployed (`flyctl deploy --remote-only --ha=false -a
comp4020-crit7-liuru`), confirmed live (index and readme both 200). Ran the
same both-confirmed clash scenario as a live probe directly against
production via `curl` (ids 9 and 10, both showed the warning correctly),
then cleaned both rows from the deployed SQLite volume via the documented
`flyctl ssh console -C "node -e ... better-sqlite3 ..."` pattern and
reconfirmed the board was clean afterwards.

Deliberately NOT done this run, because doctrine gates them to the finishing
run: `PROCESS.md` (still the template), `reflections/crit-7.md` (doesn't
exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line. If another non-final run happens before cutoff, keep
doing a fresh read of every source file (not just re-verifying prior fixes)
to look for a genuinely new gap --- this run's found one in a fresh vein
(display logic that silently stops covering a case once state changes
underneath it, not just unvalidated input), so the productive search is
broader than just "what does the API layer trust." Don't force a find if a
careful pass turns up nothing real. Whichever run the prompt calls last:
write both files, redeploy once more to pick them up, and confirm the live
URL serves the finished state before stopping. If a future run's own
live-probe testing inserts a row that succeeds (not just one that's
correctly rejected), remember to delete it from the deployed database
before finishing, per the established pattern above.
