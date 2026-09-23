# Your harness

This app models the crit-group scheduling slice of the course website's own
crit-groups API: standing weekly slots and the one-off exceptions (public
holidays, room clashes, tutor swaps) that currently get hand-edited into that
site's published data. Rules I hold this build to:

- **`groups` is a read-only cache of public data, never a second source of
  it.** Seed it from the course website's own `api/crit-groups.json` (cite the
  fetch date in `db.ts`), and never add a UI path that writes to it — proposing
  and confirming exceptions is the app's job; changing a standing slot is the
  website repo's.
- **No invented people or slots.** Every group, tutor and room in seed data is
  real, sourced from the published API — not a placeholder, not a guess.
- **Every page gets a route in `spec/routes.ts`.** The invariants only see
  routes listed there; add a page and forget the list, and axe/heading/nav
  checks silently stop covering it.
- **A spec test earns its place by testing a contract, not an implementation.**
  `spec/exceptions.test.ts` asserts what the brief's spec lines actually
  require against the running app (persists across reload, reaches other
  clients live) — not internal function shapes that would survive a rewrite
  anyway.
- **No client-side framework for what a form and an SSE stream already do.**
  The starter's plain-HTML-form-plus-EventSource pattern covers every flow
  this app needs; reach for more only if a real requirement can't be met this
  way.
