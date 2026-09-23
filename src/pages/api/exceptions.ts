import type { APIRoute } from "astro";
import { addException } from "../../lib/db";
import { bus } from "../../lib/events";

// The write half of the board: a group (or their tutor) proposes a one-off
// replacement for a standing slot. The 303 redirect makes the form work with
// no client-side JavaScript — the submitting tab re-renders from SQLite;
// every other open tab hears about it over the SSE stream.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const groupSlug = String(form.get("groupSlug") ?? "").trim();
  const week = Number(form.get("week"));
  const reason = String(form.get("reason") ?? "").trim();
  const day = String(form.get("day") ?? "").trim();
  const start = String(form.get("start") ?? "").trim();
  const end = String(form.get("end") ?? "").trim();
  const room = String(form.get("room") ?? "").trim();

  if (groupSlug && Number.isInteger(week) && reason && day && start && end) {
    const exception = addException({
      groupSlug,
      week,
      reason: reason.slice(0, 500),
      day,
      start,
      end,
      room: room ? room.slice(0, 200) : null,
    });
    bus.emit("exception", exception);
  }
  return redirect("/", 303);
};
