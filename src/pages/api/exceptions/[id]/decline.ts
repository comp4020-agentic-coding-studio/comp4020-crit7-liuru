import type { APIRoute } from "astro";
import { declineException, listExceptions } from "../../../../lib/db";
import { bus } from "../../../../lib/events";

// The other end of a proposal's lifecycle: a room clash or a tutor swap that
// didn't work out shouldn't just sit "proposed" forever — declining it is as
// real an outcome as confirming it, and both need to be visible to whoever
// is deciding between proposals for the same week.
export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);
  if (Number.isInteger(id)) {
    const exception = declineException(id);
    if (exception) bus.emit("exceptions", listExceptions());
  }
  return redirect("/", 303);
};
