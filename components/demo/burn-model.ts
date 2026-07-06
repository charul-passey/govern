import type { Event, Verdict } from "@/data/events";
import { VERDICT_META, type Tone } from "@/components/demo/verdict-meta";

// Day-of-week + fraction is the chart's x unit: Mon 00:00 = 0, Sun 23:59 ≈ 6.999.
export const DAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function timeToX(ts: string): number {
  const [day, time] = ts.split(" ");
  const [h, m] = time.split(":").map(Number);
  return (DAY_INDEX[day] ?? 0) + (h * 60 + m) / 1440;
}

export const X_END = timeToX("Sun 23:59");
export const RUNAWAY_START = timeToX("Wed 23:00"); // steepening begins here, before e6
const GHOST_END = timeToX("Thu 06:00");

export interface Vertex {
  x: number;
  y: number;
}

export interface Dot {
  x: number;
  y: number;
  tone: Tone;
}

export interface Ghost {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BurnModel {
  vertices: Vertex[]; // piecewise-linear burn line, (0,0) first
  dots: Dot[]; // one per card event, in order
  ghost: Ghost | null;
  maxY: number;
}

// Builds the burn line from spend contributions. Each event adds a vertex at
// (time, cumulative spend), so the slope changes at every event time. The runaway
// event (the one carrying a projected overnight burn) holds flat until Wed 23:00,
// then ramps steeply to its timestamp, and projects the prevented trajectory as a ghost.
export function buildBurnModel(
  results: { event: Event; result: { verdict: Verdict } }[],
): BurnModel {
  const vertices: Vertex[] = [{ x: 0, y: 0 }];
  const dots: Dot[] = [];
  let ghost: Ghost | null = null;
  let cum = 0;

  for (const { event, result } of results) {
    const x = timeToX(event.timestamp);
    const contribution = event.spendContributionUsd ?? 0;

    if (event.projectedOvernightUsd != null) {
      vertices.push({ x: RUNAWAY_START, y: cum }); // hold flat into the runaway window
      cum += contribution;
      vertices.push({ x, y: cum }); // steep ramp to the block
      ghost = { x0: x, y0: cum, x1: GHOST_END, y1: cum + event.projectedOvernightUsd };
    } else {
      cum += contribution;
      vertices.push({ x, y: cum });
    }

    dots.push({ x, y: cum, tone: VERDICT_META[result.verdict].tone });
  }

  const maxY = Math.max(1, ...vertices.map((v) => v.y), ghost ? ghost.y1 : 0);
  return { vertices, dots, ghost, maxY };
}
