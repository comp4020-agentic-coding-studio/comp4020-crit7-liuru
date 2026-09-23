import type { Exception, Group } from "./schema";

// The other half of "the slice that annoys you": a proposal can silently ask
// for a slot another group's already-confirmed exception holds for the same
// week. Computed at render time from the same rows already on the page, not
// stored — a clash appears or clears the moment either exception's status
// changes, with no extra state to keep in sync.
export function findClash(
  exception: Exception,
  all: Exception[],
  groupBySlug: Map<string, Group>,
): Exception | undefined {
  const room = exception.room ?? groupBySlug.get(exception.groupSlug)?.room;
  if (!room) return undefined;
  return all.find(
    (other) =>
      other.id !== exception.id &&
      other.status === "confirmed" &&
      other.groupSlug !== exception.groupSlug &&
      other.week === exception.week &&
      other.day === exception.day &&
      other.start === exception.start &&
      (other.room ?? groupBySlug.get(other.groupSlug)?.room) === room,
  );
}
