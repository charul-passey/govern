import { AI_INDEX_HEADLINE } from "@/data/ai-index";

// Inline-SVG line chart, zero dependencies. Static: geometry is computed at build
// time from data/ai-index.ts. Strokes use currentColor so ink tokens drive color;
// numeric labels and text are HTML overlaid at coordinates that map exactly to the
// viewBox, so type stays crisp and readable at every width.

const VB_W = 720;
const VB_H = 240;
const PAD = { top: 16, right: 88, bottom: 20, left: 8 };
const DOMAIN_MAX = 60; // headroom above the 54.2% peak
const GRID = [0, 20, 40, 60];

const N = AI_INDEX_HEADLINE.length;
const plotW = VB_W - PAD.left - PAD.right;
const plotH = VB_H - PAD.top - PAD.bottom;

const xAt = (i: number) => PAD.left + (i / (N - 1)) * plotW;
const yAt = (v: number) => PAD.top + (1 - v / DOMAIN_MAX) * plotH;

type Point = { i: number; v: number };
const series = (key: "ramp" | "census"): Point[] =>
  AI_INDEX_HEADLINE.map((d, i) => ({ i, v: d[key] })).filter(
    (p): p is Point => p.v != null,
  );

const toPoints = (pts: Point[]) =>
  pts.map((p) => `${xAt(p.i)},${yAt(p.v)}`).join(" ");

export function AdoptionChart() {
  const ramp = series("ramp");
  // Census has null gaps (pre 2023-09 and one interior month); nulls are dropped,
  // so the dashed line connects across the single missing month.
  const census = series("census");

  const rampEnd = ramp[ramp.length - 1];
  const censusEnd = census[census.length - 1];

  return (
    <figure className="mt-12 max-w-prose">
      <div className="text-sm font-semibold text-ink">
        Share of U.S. businesses paying for AI
      </div>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Line chart. Share of U.S. businesses paying for AI, January 2023 to May 2026. The Ramp AI Index rises from about 7 percent to 54.2 percent. The U.S. Census BTOS estimate reaches 20.1 percent."
        >
          {GRID.map((v) => (
            <line
              key={v}
              x1={PAD.left}
              x2={VB_W - PAD.right}
              y1={yAt(v)}
              y2={yAt(v)}
              className="text-ink/10"
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <polyline
            points={toPoints(census)}
            className="text-ink/40"
            stroke="currentColor"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={toPoints(ramp)}
            className="text-ink"
            stroke="currentColor"
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* End labels sit at the line end on wider screens; on narrow screens they
            right-anchor to the column edge so fixed-size text never overflows. */}
        <span
          className="absolute hidden -translate-y-1/2 pl-1 font-mono text-xs font-medium text-ink sm:block"
          style={{
            left: `${(xAt(rampEnd.i) / VB_W) * 100}%`,
            top: `${(yAt(rampEnd.v) / VB_H) * 100}%`,
          }}
        >
          54.2%
        </span>
        <span
          className="absolute right-0 -translate-y-1/2 pr-1 text-right font-mono text-xs font-medium text-ink sm:hidden"
          style={{ top: `${(yAt(rampEnd.v) / VB_H) * 100}%` }}
        >
          54.2%
        </span>

        <span
          className="absolute hidden -translate-y-1/2 pl-1 font-mono text-xs text-ink/50 sm:block"
          style={{
            left: `${(xAt(censusEnd.i) / VB_W) * 100}%`,
            top: `${(yAt(censusEnd.v) / VB_H) * 100}%`,
          }}
        >
          20.1%
          <span className="block font-mono text-xs text-ink/40">estimate</span>
        </span>
        <span
          className="absolute right-0 -translate-y-1/2 pr-1 text-right font-mono text-xs text-ink/50 sm:hidden"
          style={{ top: `${(yAt(censusEnd.v) / VB_H) * 100}%` }}
        >
          20.1%
          <span className="block font-mono text-xs text-ink/40">estimate</span>
        </span>

        {/* Baseline floor label, so the reader can see the lines start at zero. */}
        <span
          className="absolute -translate-y-1/2 font-mono text-xs text-ink/40"
          style={{
            left: `${(PAD.left / VB_W) * 100}%`,
            top: `${(yAt(0) / VB_H) * 100}%`,
          }}
        >
          0%
        </span>
      </div>

      <figcaption className="mt-3 font-mono text-xs text-ink/50">
        Ramp AI Index, ramp.com/data, May 2026.
      </figcaption>
    </figure>
  );
}
