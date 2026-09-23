import { beforeAll, describe, expect, inject, it } from "vitest";

// The brief's own checkable lines, turned into tests against the running
// app: a proposed exception persists across a reload, a confirmation is
// reachable end to end, and both reach other clients over the SSE stream
// the starter's plumbing already proved works.
const baseUrl = inject("baseUrl");

describe("crit slot exceptions", () => {
  let reason: string;

  beforeAll(() => {
    reason = `spec probe ${process.hrtime.bigint()}`;
  });

  // Astro checks form POSTs carry a same-origin Origin header (CSRF
  // protection); browsers send it automatically, a bare fetch doesn't.
  const post = (path: string, body?: URLSearchParams) =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  it("shows every group's standing slot", async () => {
    const res = await fetch(baseUrl);
    const html = await res.text();
    for (const group of ["Shitao", "Bada", "Baishi", "Dachi", "Yunlin", "Liuru"]) {
      expect(html).toContain(group);
    }
  });

  it("accepts a proposed exception and redirects back to the board", async () => {
    const res = await post(
      "/api/exceptions",
      new URLSearchParams({
        groupSlug: "liuru",
        week: "10",
        reason,
        day: "Thu",
        start: "15:30",
        end: "17:00",
        room: "",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");
  });

  it("persists the proposal: a fresh page load includes it, marked proposed", async () => {
    const res = await fetch(baseUrl);
    const html = await res.text();
    expect(html).toContain(reason);
    expect(html).toContain("proposed");
  });

  it("broadcasts a new proposal over the SSE stream", async () => {
    const live = `live probe ${process.hrtime.bigint()}`;

    // subscribe first, then post, then read until the event arrives
    const stream = await fetch(new URL("/api/events", baseUrl));
    expect(stream.headers.get("content-type")).toContain("text/event-stream");
    const reader = stream.body?.getReader();
    if (!reader) throw new Error("no response body");

    await post(
      "/api/exceptions",
      new URLSearchParams({
        groupSlug: "baishi",
        week: "11",
        reason: live,
        day: "Thu",
        start: "09:00",
        end: "10:30",
        room: "",
      }),
    );

    const decoder = new TextDecoder();
    let received = "";
    while (!received.includes(live)) {
      const { value, done } = await reader.read();
      if (done) throw new Error("stream ended before the event arrived");
      received += decoder.decode(value, { stream: true });
    }
    await reader.cancel();
    expect(received).toContain(`data: `);
    expect(received).toContain(live);
  }, 10_000);

  it("confirms an exception, and the confirmation persists", async () => {
    const list = await fetch(baseUrl);
    const html = await list.text();
    const match = html.match(/action="\/api\/exceptions\/(\d+)\/confirm"/);
    if (!match) throw new Error("no proposed exception with a confirm form found");
    const id = match[1];

    const res = await post(`/api/exceptions/${id}/confirm`);
    expect(res.status).toBe(303);

    const after = await fetch(baseUrl);
    const afterHtml = await after.text();
    expect(afterHtml).toContain(`id="exception-${id}"`);
    expect(afterHtml).toMatch(new RegExp(`id="exception-${id}"[^>]*data-status="confirmed"`));
  });
});
