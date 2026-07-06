"use client";

import { useEffect, useRef, useState } from "react";
import type { Tone } from "@/components/demo/verdict-meta";
import type { Vertex, Dot, Ghost } from "@/components/demo/burn-model";

const W = 700;
const TOP = 12;
const PLOT_H = 60;
const VBH = TOP + PLOT_H;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Dots: catches use their verdict color at higher opacity; approvals near-invisible.
const DOT: Record<Tone, string> = {
  approved: "h-1 w-1 bg-ink/15",
  caution: "h-1.5 w-1.5 bg-verdict-caution/70",
  blocked: "h-2 w-2 bg-verdict-blocked",
  neutral: "h-1 w-1 bg-ink/20",
};

export function BurnTimeline({
  vertices,
  dots,
  ghost,
  maxY,
  total,
  xEnd,
  replayMs,
  playing,
  instant,
  reduced,
  onCross,
  onComplete,
}: {
  vertices: Vertex[];
  dots: Dot[];
  ghost: Ghost | null;
  maxY: number;
  total: number;
  xEnd: number;
  replayMs: number;
  playing: boolean;
  instant: boolean;
  reduced: boolean;
  onCross: (index: number) => void;
  onComplete: () => void;
}) {
  const [simX, setSimX] = useState(0);
  const firedRef = useRef(-1);
  const doneRef = useRef(false);

  // A single rAF clock maps Monday 00:00 through Sunday 23:59 linearly onto the
  // x-axis at constant speed. Dots and cards fire as the clock crosses each event.
  useEffect(() => {
    if (reduced || instant) {
      setSimX(xEnd);
      return;
    }
    if (!playing) return;

    firedRef.current = -1;
    doneRef.current = false;
    setSimX(0);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / replayMs, 1);
      const x = p * xEnd;
      setSimX(x);
      while (firedRef.current + 1 < dots.length && dots[firedRef.current + 1].x <= x) {
        firedRef.current += 1;
        onCross(firedRef.current);
      }
      if (p >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, instant, reduced, xEnd, replayMs, dots, onCross, onComplete]);

  const sx = (x: number) => (x / 7) * W;
  const sy = (y: number) => TOP + PLOT_H * (1 - y / maxY);
  const leftPct = (x: number) => `${(x / 7) * 100}%`;
  const topPct = (y: number) => `${(sy(y) / VBH) * 100}%`;

  // Draw the line through every vertex reached, plus an interpolated point at simX.
  const drawn: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    if (v.x <= simX) {
      drawn.push([v.x, v.y]);
    } else {
      const last = vertices[i - 1] ?? { x: 0, y: 0 };
      if (v.x > last.x) {
        const t = (simX - last.x) / (v.x - last.x);
        drawn.push([simX, last.y + (v.y - last.y) * t]);
      }
      break;
    }
  }
  if (drawn.length === 0) drawn.push([0, 0]);
  const linePath = drawn.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");

  const ghostVisible = ghost != null && simX >= ghost.x0;
  const terminus = vertices[vertices.length - 1];
  const totalVisible = simX >= terminus.x;

  return (
    <figure className="mt-4">
      <p className="text-xs text-ink/50">Cumulative AI spend · simulated week</p>
      {ghost && ghostVisible && (
        <p className="mt-1 font-mono text-xs text-verdict-blocked/80 sm:hidden">
          +$1,090 by 06:00 without policy
        </p>
      )}
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${W} ${VBH}`}
          className="block w-full overflow-visible"
          role="img"
          aria-label="Cumulative AI spend across the week, blocked at the runaway agent"
        >
          {ghost && ghostVisible && (
            <polyline
              points={`${sx(ghost.x0)},${sy(ghost.y0)} ${sx(ghost.x1)},${sy(ghost.y1)}`}
              className="animate-fade-in stroke-verdict-blocked/60"
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
          <polyline
            points={linePath}
            className="stroke-ink"
            fill="none"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {dots
          .filter((d) => d.x <= simX)
          .map((d, i) => (
            <span
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${DOT[d.tone]}`}
              style={{ left: leftPct(d.x), top: topPct(d.y) }}
            />
          ))}

        {ghost && ghostVisible && (
          <span
            className="absolute hidden -translate-x-full -translate-y-1/2 whitespace-nowrap pr-1 font-mono text-xs text-verdict-blocked/80 animate-fade-in sm:block"
            style={{ left: leftPct(ghost.x1), top: topPct(ghost.y1) }}
          >
            +$1,090 by 06:00 without policy
          </span>
        )}

        {totalVisible && (
          <span className="absolute right-0 top-0 font-mono text-xs text-ink animate-fade-in">
            week total ${total.toLocaleString("en-US")}
          </span>
        )}
      </div>

      <div className="mt-1 grid grid-cols-7 text-center font-mono text-xs text-ink/40">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </figure>
  );
}
