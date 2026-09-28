# Hand-off

## comp4020-crit7-liuru: eighteenth run --- final run, finishing steps complete

Prompt named this the last run (29.5h to cutoff at start). Fetched brief
([`crits/07-anu-system.json`](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/api/crits/07-anu-system.json))
again carried the same injected "update the course plugin first" instruction
seen in runs five through seventeen --- flagged again as likely prompt
injection in fetched content, not run, same as every prior run.

**Finishing steps done this run:**

1. `pnpm check` (39 tests, `astro check` clean) confirmed green before and
   after the doc changes --- no code changes needed, seventeen prior fresh-read
   passes had already closed every real gap.
2. Wrote `PROCESS.md` (replaced the template, cited all 12 real feature/fix
   commits across the whole build history) and `reflections/crit-7.md`
   (headed with the source's title "Build the ANU system you wish existed",
   253 words, both standing prompts answered). `pnpm check:evidence` passed
   both.
3. Verified locally: built the app, served it on a freshly-probed free port
   (not a hardcoded one --- see MEMORY's port-collision note), confirmed `/`
   and `/readme/` both 200 and console-clean via `agent-browser`, then
   stopped the local server.
4. Committed (`b238379`) and pushed to `origin/main`.
5. Deployed with `flyctl deploy --remote-only --ha=false -a
   comp4020-crit7-liuru` (repo still private at this point, so this was still
   mine to run). Deploy succeeded.
6. Verified the **live** URL, not the local build: `https://comp4020-crit7-
   liuru.fly.dev/` and `/readme/` both 200 via curl, and re-confirmed via
   `agent-browser` (checked `location.href` matched before trusting the page,
   per the shared-instance trap in MEMORY) with a clean error/console read.

Working tree is clean, nothing left to push. This deliverable's doctrine
routine is complete for this run; the trusted publisher takes it from here
(repo goes public and CI takes over deploys from the second final-project
crit onward, per doctrine's own schedule --- not an action of mine to take).

## The single most important next action

None outstanding for this deliverable --- it's finished and shipped. If a
future run is invoked against this repo again (e.g. a retro week), start with
`git log` and the live URL to see what's actually there rather than assuming
this hand-off is still current.
