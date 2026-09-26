# Hand-off

## comp4020-crit7-liuru: twelfth run --- added a missing aria-live region, deployed

77.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on (eighth time):** the fetched course-source JSON
still carries the same "Warning: Update the course plugin first" section
instructing `claude plugin marketplace update comp4020` /
`claude plugin update comp4020@comp4020`. Same call as runs five through
eleven: not part of doctrine or the brief's own spec lines, treated as a
likely prompt injection in fetched content, not run.

**Fresh-read pass found a genuine gap, a new category again:**
accessibility of the *live* update path specifically, not the static
render axe-core already covers. `#exceptions` (`src/pages/index.astro`)
had no `aria-live` region, so a screen-reader user watching the board got
no signal when another open tab's proposal/confirm/decline rebuilt the
list over SSE --- silent for exactly the "live across every open tab"
behaviour the README calls the app's core promise. `pnpm check`'s
axe-core pass only renders the page once via jsdom and never exercises
the SSE rebuild, so this was invisible to every prior run's test-suite
green. Fix: `aria-live="polite"` on the `<ul id="exceptions">`, one
attribute (`3179db6`). Worth remembering as its own category for future
fresh-read passes on any live-updating page: check accessibility of the
*dynamic* update, not just the first render --- distinct from all the
categories the last several hand-offs already logged (unvalidated input
at the API layer, display logic that stops covering a case once state
changes underneath it, doc/code drift, now this).

Hit the shared-`agent-browser`-instance trap from `MEMORY.md` again while
verifying: a manual local server on port 4399 collided with an unrelated
process already bound there (another agent's `aps-ai-tracker` dev
server) --- `curl`/`ss` confirmed my own `node dist/server/entry.mjs`
never actually started (EADDRINUSE, silent exit, empty log), yet
`agent-browser open`/`eval` against that port kept reporting the *other*
app's title and DOM (`AI Tracker`) even across a fresh `open` and a
`location.reload()`. Recovered by binding to a genuinely free port
(`node -e` probing a random port via `net.createServer().listen(0)`)
rather than a hardcoded guess, then reopening --- worked immediately.
Worth adding to the pattern already in `MEMORY.md`: don't just re-`open`
when a title/DOM looks wrong after a URL match, also `curl`/`ss` the port
directly to see whether it's actually your own process listening there,
especially on a manually-launched (not `pnpm preview`) local server where
nothing else would have surfaced a silent bind failure.

39 tests still green (`pnpm check`, unaffected --- this was a template-only
change). Verified locally in a real browser (once past the port
collision above): index and `/readme/` both load with the right
title/content, `document.querySelector('#exceptions').getAttribute
('aria-live')` reads `"polite"`, no real console/page errors (the stray
`[vite]`/prefetch lines `agent-browser console` showed were confirmed
stale buffer from the earlier wrong-port tab, via `document.scripts`
showing only the one inline production script). Committed (`3179db6`),
pushed to `origin/main`, redeployed (`flyctl deploy --remote-only
--ha=false -a comp4020-crit7-liuru`), confirmed the live URL serves the
fix (`curl` shows `aria-live="polite"` on the deployed page). No database
state touched this run.

Deliberately NOT done this run, because doctrine gates them to the
finishing run: `PROCESS.md` (still the template), `reflections/crit-7.md`
(doesn't exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line. If another non-final run happens before cutoff,
keep doing a fresh read of every source file (not just re-verifying prior
fixes) --- four runs running have each found a genuinely new gap in a
different vein now, so there may be real value left to find; don't force
one if a careful pass turns up nothing real, though, per the eighth run's
own precedent. Whichever run the prompt calls last: write both files,
redeploy once more to pick them up, and confirm the live URL serves the
finished state before stopping.
