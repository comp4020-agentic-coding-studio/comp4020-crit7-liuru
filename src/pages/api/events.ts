import type { APIRoute } from "astro";
import type { Exception } from "../../lib/db";
import { bus } from "../../lib/events";

// The minimal server-sent-events (SSE) pattern: a long-lived streaming
// response the browser consumes with `new EventSource("/api/events")`.
// SSE is one-directional (server → browser) and plain HTTP, which makes it
// the simplest live channel that works everywhere — reach for WebSockets
// only when the client needs to push over the same connection.
//
// Each message carries the whole exceptions list, not just the row that
// changed: a clash warning depends on *other* rows (another group's
// confirmed exception), so a client re-deriving it from one row alone would
// miss a clash that appears or clears because of an exception it was never
// told about. The list is small enough that resending it all is cheaper
// than the alternative — a second, growing message shape for "and here's
// what else this affects".
export const GET: APIRoute = () => {
  let onExceptions: (all: Exception[]) => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      // an opening comment so the client (and the post-deploy CI probe) sees
      // bytes immediately, and a periodic one so proxies don't drop the
      // connection as idle
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
      onExceptions = (all) => {
        controller.enqueue(`data: ${JSON.stringify(all)}\n\n`);
      };
      bus.on("exceptions", onExceptions);
    },
    cancel() {
      clearInterval(heartbeat);
      bus.off("exceptions", onExceptions);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
};
