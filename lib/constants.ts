// The Govern build ran July 3 to July 5, 2026: three days.
export const BUILD_START = new Date("2026-07-03T00:00:00Z");
export const BUILD_END = new Date("2026-07-05T00:00:00Z");

// Inclusive whole-day span between two dates. July 3 to July 5 reads as 3 days.
export function dayCount(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
}

// Build duration, derived once and shared by the hero, footer, and build log.
export const BUILD_DAYS = dayCount(BUILD_START, BUILD_END);
