# Process overview

## What I built

A crit-slot exceptions board: the six standing crit-group slots published by
the course website's own `api/crit-groups.json`, plus a place to propose,
confirm or decline one-off replacements for a group's week — the small
coordination problem that today lands as a hand-edited PR against that site's
data. `README.md` covers what the app is and what good looks like here; this
is how I got there.

## How I got here

The starter (`comp4020-agentic-coding-studio/template-dynamic@a7e0ee20`,
[`e165aae`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/e165aae))
ships a guestbook over Astro, Drizzle and SQLite. The brief asked for "the ANU
system that reliably ruins your week" modelled end to end, not the whole
thing, so I picked the slice of my own crit group's world that's genuinely
awkward today — a room clash or public-holiday swap that only exists as a
hand-edited array entry on the course website — and replaced the guestbook
with it in one commit
([`60d70ff`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/60d70ff)):
real groups, tutors and rooms seeded from the course API, a form to propose a
replacement slot, a list of open proposals.

A single propose form isn't a coordination tool without a way to close a
proposal out, so the next few runs built the rest of the lifecycle rather than
stopping at "renders": a decline path so a proposal doesn't sit open forever
([`9af0c7d`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/9af0c7d)),
a room-clash warning against another group's already-confirmed exception
([`aed4633`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/aed4633)),
the exceptions list rebuilding live over SSE instead of patching one row at a
time
([`96ced6e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/96ced6e)),
and a per-group filter
([`e69c785`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/e69c785)).

The bulk of the middle stretch was adversarial re-reading of my own code
rather than new features, because a form that only shows the right buttons
isn't the same claim as an API that only accepts the right transitions. A
fresh pass over `db.ts` found that a raw POST could still confirm or decline
an already-settled exception, or a slug for a group that doesn't exist; fixed
at the database layer, not the form, since that's the layer a `curl` can
reach past
([`eb254a0`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/eb254a0)),
followed by the same check on the numeric/enum fields
([`7ea6cfd`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/7ea6cfd)).
A second such pass found the clash warning itself had a gap: it was only
computed while a proposal was still `proposed`, so two proposals that clashed
while pending could both get independently confirmed from separate tabs and
the double-booking would vanish from the UI the moment both sides settled —
exactly the scenario the app's whole live-across-tabs premise makes plausible.
Fixed by keeping the derived warning live across every non-declined status,
not just the first one it was built against
([`9d66e8c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/9d66e8c)).
A third pass caught the mirror problem in prose rather than code: `README.md`
still claimed clash detection wasn't done, three commits after it was
([`3b1ca32`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/3b1ca32)).

The last functional gap was accessibility of the SSE path specifically, not
the static render: `spec/invariants.test.ts` renders the page once and never
exercises a live rebuild, so a screen-reader user watching an already-open tab
had no signal that another group's action had just changed the list.
[`3179db6`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/3179db6)
adds the `aria-live` region the static test can't see the need for.
[`c1748ff`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-liuru/commit/c1748ff)
re-verified the seeded groups and exceptions against the course API found no
drift; every fresh-read pass since (nine in a row by this run) found nothing
further, which is the expected shape of a slice this thin once its real gaps
are closed, not a sign the search was too shallow.

I knew the result was right the same way each fix above was found: not by
trusting a green `pnpm check` on its own (39 tests, `astro check` clean, both
confirmed again this run), but by periodically re-reading the actual source
end to end looking for a specific unchecked claim — a status transition a
form hides but an API doesn't guard, a derived value that stops being
recomputed once its status changes, a piece of documentation that outlived
the code it described — the same discipline `spec/exceptions.test.ts` itself
follows by asserting the brief's actual contract (persists across reload,
reaches other clients live) rather than an internal function's shape.
