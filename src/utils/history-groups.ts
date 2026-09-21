// History grouping (docs/Design.md §15): Today / Yesterday / Earlier.
// Day boundaries are local-midnight; stored UTC ISO timestamps parse into
// absolute instants, so grouping is timezone-correct. `now` is injectable
// for deterministic tests. Unparseable timestamps fall into Earlier —
// never dropped, never promoted to Today.

export type HistoryGroupTitle = "Today" | "Yesterday" | "Earlier";

export type HistoryGroup<T> = {
  title: HistoryGroupTitle;
  items: T[];
};

const DAY_MS = 86_400_000;

function startOfLocalDay(date: Date): number {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

/** Bucket history items (each carrying a UTC ISO `viewedAt`), newest group
 * first, order within groups preserved. Empty groups are omitted. */
export function groupHistoryItems<T extends { viewedAt: string }>(
  items: readonly T[],
  now: Date = new Date(),
): HistoryGroup<T>[] {
  const todayStart = startOfLocalDay(now);
  const yesterdayStart = todayStart - DAY_MS;
  const today: T[] = [];
  const yesterday: T[] = [];
  const earlier: T[] = [];
  for (const item of items) {
    const time = new Date(item.viewedAt).getTime();
    if (Number.isNaN(time) || time < yesterdayStart) {
      earlier.push(item);
    } else if (time < todayStart) {
      yesterday.push(item);
    } else {
      today.push(item);
    }
  }
  return (
    [
      { title: "Today", items: today },
      { title: "Yesterday", items: yesterday },
      { title: "Earlier", items: earlier },
    ] as HistoryGroup<T>[]
  ).filter((group) => group.items.length > 0);
}

/** "2:32 PM" for a same-day view. Locale time, hour + minute only. */
export function formatHistoryTime(viewedAt: string): string {
  const time = new Date(viewedAt);
  if (Number.isNaN(time.getTime())) return "";
  return time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** "Sep 18" (this year) or "Sep 18, 2025" for older views. */
export function formatHistoryDate(viewedAt: string, now: Date = new Date()): string {
  const time = new Date(viewedAt);
  if (Number.isNaN(time.getTime())) return "";
  return time.toLocaleDateString(
    [],
    time.getFullYear() === now.getFullYear()
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}
