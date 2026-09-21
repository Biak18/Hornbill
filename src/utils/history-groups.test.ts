// History grouping tests (docs/Design.md §15). Fixed local "now" keeps
// day-boundary assertions deterministic regardless of when the suite runs.

import { describe, expect, it } from "vitest";
import {
  formatEntryMeta,
  formatHistoryDate,
  formatHistoryTime,
  groupHistoryItems,
} from "./history-groups";

// Noon local, Sep 21 2026.
const NOW = new Date(2026, 8, 21, 12, 0, 0);

function at(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): string {
  return new Date(year, month, day, hour, minute).toISOString();
}

describe("groupHistoryItems", () => {
  it("buckets today, yesterday, and earlier in order", () => {
    const groups = groupHistoryItems(
      [
        { id: "t1", viewedAt: at(2026, 8, 21, 10, 30) },
        { id: "t2", viewedAt: at(2026, 8, 21, 0, 5) },
        { id: "y1", viewedAt: at(2026, 8, 20, 23, 59) },
        { id: "e1", viewedAt: at(2026, 8, 18, 9, 0) },
      ],
      NOW,
    );
    expect(groups.map((g) => g.title)).toEqual([
      "Today",
      "Yesterday",
      "Earlier",
    ]);
    expect(groups[0]?.items.map((i) => i.id)).toEqual(["t1", "t2"]);
    expect(groups[1]?.items.map((i) => i.id)).toEqual(["y1"]);
    expect(groups[2]?.items.map((i) => i.id)).toEqual(["e1"]);
  });

  it("omits empty groups", () => {
    const groups = groupHistoryItems(
      [{ id: "e1", viewedAt: at(2026, 7, 1, 9, 0) }],
      NOW,
    );
    expect(groups.map((g) => g.title)).toEqual(["Earlier"]);
  });

  it("sends unparseable timestamps to Earlier, never dropping them", () => {
    const groups = groupHistoryItems([{ id: "x", viewedAt: "not-a-date" }], NOW);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe("Earlier");
  });

  it("returns no groups for empty history", () => {
    expect(groupHistoryItems([], NOW)).toEqual([]);
  });
});

describe("formatHistoryTime", () => {
  it("renders hour and minute", () => {
    expect(formatHistoryTime(at(2026, 8, 21, 10, 30))).toContain("10:30");
  });

  it("returns empty for garbage input", () => {
    expect(formatHistoryTime("not-a-date")).toBe("");
  });
});

describe("formatHistoryDate", () => {
  it("renders month and day within the same year", () => {
    // Locale-independent: day digits present, no time component. (The
    // device locale decides month wording — e.g. "Sep" vs "9월".)
    const text = formatHistoryDate(at(2026, 8, 18, 9, 0), NOW);
    expect(text).toContain("18");
    expect(text).not.toContain(":");
  });

  it("adds the year for older views", () => {
    const text = formatHistoryDate(at(2024, 0, 5, 9, 0), NOW);
    expect(text).toContain("2024");
  });

  it("returns empty for garbage input", () => {
    expect(formatHistoryDate("not-a-date", NOW)).toBe("");
  });
});

describe("formatEntryMeta", () => {
  it("shows time for today and yesterday", () => {
    // Morning hours render identically in 12h and 24h locales.
    expect(formatEntryMeta(at(2026, 8, 21, 10, 30), NOW)).toContain("10:30");
    expect(formatEntryMeta(at(2026, 8, 20, 9, 15), NOW)).toContain("9:15");
  });

  it("shows a date for older views", () => {
    const text = formatEntryMeta(at(2026, 8, 18, 9, 0), NOW);
    expect(text).toContain("18");
    expect(text).not.toContain(":");
  });

  it("returns empty for garbage input", () => {
    expect(formatEntryMeta("not-a-date", NOW)).toBe("");
  });
});
