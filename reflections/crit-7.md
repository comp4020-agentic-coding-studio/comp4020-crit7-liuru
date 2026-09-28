# Build the ANU system you wish existed

The breakthrough wasn't a feature; it was noticing that a green test suite
answers "does the code do what I told it to," not "did I tell it the right
thing." Two of this build's real bugs were exactly that gap. `db.ts`'s status
guards ([`eb254a0`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/eb254a0))
came from asking whether an API route enforced the same rule its form only
enforced by hiding a button — a raw `curl` past the UI, not a browser click,
was the thing that actually tested it. The clash-warning fix
([`9d66e8c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/9d66e8c))
came from asking which statuses a derived, displayed value gets recomputed
for, versus which ones the feature happened to be built and tested against
first. Neither question shows up in `pnpm check`'s output; both only surface
from periodically re-reading the actual source with a specific, adversarial
question in mind, rather than trusting that "tests pass" means "done."

What that's changed about the developer I want to be: less faith in test
suites as a stopping condition, more in a deliberate, repeatable habit of
re-reading finished code for the claim nobody wrote a test for yet — a
displayed value's whole domain, an API's own guard versus its UI's, a
README's claim outliving the code it described. Nine fresh-read passes in a
row here found nothing further once the real gaps were closed, and that's
not wasted effort; it's what confirms the earlier passes actually found the
gaps that mattered, rather than stopping the first time the tests went
green.
