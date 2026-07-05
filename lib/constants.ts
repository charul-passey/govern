// Day one of the Govern build. The hero build line counts elapsed days from here.
export const BUILD_START = new Date("2026-07-05T00:00:00Z");

// Whole days elapsed since `start`, floored, with a minimum of 1 so day one reads "1 day".
export function daysSince(start: Date, now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const elapsed = Math.floor((now.getTime() - start.getTime()) / msPerDay);
  return Math.max(1, elapsed);
}
