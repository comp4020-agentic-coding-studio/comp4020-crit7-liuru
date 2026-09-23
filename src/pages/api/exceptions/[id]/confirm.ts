import type { APIRoute } from "astro";
import { confirmException } from "../../../../lib/db";
import { bus } from "../../../../lib/events";

// Marks a proposed exception as confirmed — the point at which it would be
// carried over into the course website's own published exceptions array, a
// step this app tracks but deliberately doesn't perform itself: that data is
// public truth, edited in that repo, not written by this one.
export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);
  if (Number.isInteger(id)) {
    const exception = confirmException(id);
    if (exception) bus.emit("exception", exception);
  }
  return redirect("/", 303);
};
