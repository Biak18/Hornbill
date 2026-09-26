// Shared domain constants. Single source of truth — do not redeclare these
// per file (duplicate caps drift apart silently).

/** Milliseconds in a day (history grouping, featured-word rotation). */
export const DAY_MS = 86_400_000;

/** Maximum stored history entries (SQLite limit and store slice agree). */
export const MAX_HISTORY = 50;
