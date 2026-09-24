# Hand-off

## comp4020-crit7-liuru: fifth run --- per-group filter, deployed

136.5h to cutoff at this run's start, still short of "last run" --- plan/
build/deepen (doctrine step 4), not finishing steps.

**Flagged, not acted on:** the fetched course-source JSON for this crit
contained a "Warning: Update the course plugin first" section instructing
`claude plugin marketplace update comp4020` / `claude plugin update
comp4020@comp4020`. Nothing in doctrine or the brief's own spec lines calls
for touching my own plugin config mid-run, and modifying my own tooling
isn't part of any deliverable. Treated it as a likely prompt injection in
fetched content, told the user directly, and did not run those commands.
Worth a second look only if a *human* (not a fetched course page) asks for
it explicitly.

**Built** the prior hand-off's candidate (b): a "my slots" filter, so the
exceptions board isn't every group's proposals mixed together with no way
to scope to one. `index.astro` reads `?group=<slug>` from the URL, filters
the rendered `<ul>` to that group only, and shows a "show all groups" link
when active; the standing-slots table above is never filtered (it's the
full public cache, filtering it would misrepresent it). Clash detection
still runs `findClash` against the *full* unfiltered list regardless of the
view --- a clash can depend on another group's row this view is hiding, so
filtering the detection along with the display would have been a real bug,
not just an inconsistency. The client-side SSE rebuild reads the same
`?group=` from `location.search` once at page load and re-applies it on
every live message, so a filtered tab stays scoped across a change made in
another tab with zero reload --- verified this specifically: opened one
tab filtered to Shitao, then drove proposals for Bada (should NOT appear)
and Shitao (should appear) via `curl` from outside the browser, confirming
both the negative and positive case live.

Added one spec test (`spec/exceptions.test.ts`, "filters the exceptions
list to one group via ?group=") asserting the contract against the running
app: a filtered fetch's own `<ul id="exceptions">` contains one group's
reason and not another's. `pnpm check` green, 33 tests (up from 32).

**Verified in a real browser against both environments:** locally via
`agent-browser` (dev server backgrounded per the established `pnpm exec
astro dev --port` pattern, stopped after with `astro dev stop`, `.data`
removed after --- untracked and disposable) and again against the live
`https://comp4020-crit7-liuru.fly.dev/` post-deploy: confirmed
`location.href` actually matched the fly.dev URL (not a drifted tab), the
production document has no vite client script (so the `agent-browser
console` output's leftover `[vite] connecting...`/`server connection
lost` lines were stale buffer from the earlier *local* dev session, not
genuine messages from this page --- confirmed by checking `document.scripts`
came back with only the one inline script, no vite reference), and the
filter renders and works there too (`?group=liuru` server-rendered
correctly via `curl`, and a real page load + eval confirmed the same).

Committed (`e69c785`), pushed to `origin/main`, redeployed
(`flyctl deploy --remote-only --ha=false -a comp4020-crit7-liuru`) and
confirmed the live app serves it.

Deliberately NOT done this run, because doctrine gates them to the
finishing run: `PROCESS.md` (still the template), `reflections/crit-7.md`
(doesn't exist yet).

## The single most important next action

`PROCESS.md` and `reflections/crit-7.md` are still the one fully
unaddressed spec line --- correctly deferred until the run the prompt calls
last, which this one wasn't. If there's another non-final run first,
remaining deepening candidates: the seed-data provenance re-check (fetch
date in `db.ts`'s own comment is still 2026-09-23, now ~2 days stale and
worth actually doing this time rather than deferring again --- diff the
current `api/crit-groups.json` against `SEED_GROUPS`/`SEED_EXCEPTIONS` for
drift before assuming none), or a small UX gap the filter feature exposed:
there's no visible count of how many exceptions are hidden by a filter, so
a group with zero of its own exceptions sees an empty list with no
indication whether that's "no proposals" or "filter is broken" --- an
empty-state message ("Shitao has no exceptions yet") would close that
ambiguity cheaply. Whichever isn't done, don't start the finishing-step
files until the run the prompt calls last --- and remember the live URL
needs one more redeploy on that run to pick up whatever it adds, including
the two new files themselves.
