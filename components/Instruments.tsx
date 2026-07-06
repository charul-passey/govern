"use client";

import { useState } from "react";

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function num(s: string): number {
  const v = parseFloat(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function CostStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-ground p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tracking-tight text-ink">{value}</div>
    </div>
  );
}

function Calculator() {
  const [volume, setVolume] = useState(500); // Mtok / month
  const [frontierShare, setFrontierShare] = useState(10); // %
  const [frontierPrice, setFrontierPrice] = useState("15.00"); // $/Mtok
  const [efficientPrice, setEfficientPrice] = useState("0.80"); // $/Mtok

  const fp = num(frontierPrice);
  const ep = num(efficientPrice);
  const frontierVol = (volume * frontierShare) / 100;
  const efficientVol = volume - frontierVol;
  const routed = frontierVol * fp + efficientVol * ep;
  const allFrontier = volume * fp;
  const annualSaved = Math.max(0, allFrontier - routed) * 12;

  return (
    <div className="mt-10 rounded-md border border-ink/10 bg-panel p-6 sm:p-8">
      <h3 className="text-lg font-semibold tracking-tight text-ink">Routing economics</h3>
      <p className="mt-1 text-sm text-ink/60">
        The spread between model tiers is the lever. Drag it.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="ie-volume" className="text-sm font-medium text-ink">
              Monthly volume (Mtok)
            </label>
            <span className="font-mono text-sm text-ink/70">{volume} Mtok</span>
          </div>
          <input
            id="ie-volume"
            type="range"
            min={10}
            max={2000}
            step={10}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-ink"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="ie-share" className="text-sm font-medium text-ink">
              Share routed to frontier (%)
            </label>
            <span className="font-mono text-sm text-ink/70">{frontierShare}%</span>
          </div>
          <input
            id="ie-share"
            type="range"
            min={0}
            max={100}
            step={1}
            value={frontierShare}
            onChange={(e) => setFrontierShare(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-ink"
          />
        </div>

        <div>
          <label htmlFor="ie-frontier-price" className="text-sm font-medium text-ink">
            Frontier price ($/Mtok)
          </label>
          <div className="mt-2 flex items-center rounded-md border border-ink/15 bg-ground px-3 focus-within:ring-2 focus-within:ring-ink">
            <span className="text-sm text-ink/50">$</span>
            <input
              id="ie-frontier-price"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={frontierPrice}
              onChange={(e) => setFrontierPrice(e.target.value)}
              className="w-full bg-transparent py-2 pl-1 text-sm text-ink focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ie-efficient-price" className="text-sm font-medium text-ink">
            Efficient price ($/Mtok)
          </label>
          <div className="mt-2 flex items-center rounded-md border border-ink/15 bg-ground px-3 focus-within:ring-2 focus-within:ring-ink">
            <span className="text-sm text-ink/50">$</span>
            <input
              id="ie-efficient-price"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={efficientPrice}
              onChange={(e) => setEfficientPrice(e.target.value)}
              className="w-full bg-transparent py-2 pl-1 text-sm text-ink focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <CostStat label="With routing" value={`${fmt(routed)}/mo`} />
        <CostStat label="All frontier" value={`${fmt(allFrontier)}/mo`} />
      </div>

      <div className="mt-4 rounded-md bg-accent p-5">
        <div className="font-mono text-4xl font-bold tracking-tight text-ink">
          {fmt(annualSaved)}
        </div>
        <p className="mt-1 text-sm text-ink/70">saved per year by routing</p>
      </div>

      <p className="mt-4 text-xs text-ink/50">
        Prices are illustrative and editable. The ratio is the point.
      </p>
    </div>
  );
}

export function Instruments() {
  return (
    <section id="instruments" className="bg-ground px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-shell">
        <div className="max-w-prose">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">INSTRUMENTS</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            Budgets for spend that thinks
          </h2>

          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
            <p>
              A cap is not an instrument. It is a surrender: one number, set once,
              blind to whether the spend it blocks was waste or the best money the
              company spent that month. Volatile, machine-initiated spend needs
              instruments the way portfolios need them: tools that price variance
              instead of forbidding it.
            </p>
            <p>
              Govern’s policies carry three. Variance bands hold each team to a
              tolerance around its envelope, so a 96% overnight jump in unit cost
              gets caught while a growing team’s healthy ramp does not. Response
              ladders make enforcement proportional: alert, then throttle, then
              block, each step reversible until the last. And routing economics make
              the default cheap: efficient models by default, frontier models by
              exception, because the spread between tiers is the single largest lever
              in any AI budget.
            </p>
            <p>
              One number these policies never use: cost per token. Unit costs only
              mean something operational. Cost per resolved ticket. Cost per merged
              PR. Cost per qualified lead. A budget denominated in work can be
              governed; a budget denominated in tokens can only be watched.
              Strictness, in this scheme, never changes the size of a budget. It
              changes the controls around it.
            </p>
          </div>

          <Calculator />

          <p className="mt-10 text-lg leading-relaxed text-ink/80">
            The other side of the market is already moving. Model providers are
            building budget APIs, programmatic limits, and real-time cost telemetry
            into their platforms, because unbounded spend produces unhappy buyers and
            churn. At Stripe Sessions this year, Anthropic’s monetization platform
            lead described a near future where agents run thousands of tasks against
            cost envelopes they can query and tune, and called manual limit-setting
            impossible at that scale. The supply side is building the meter. The
            demand side, the policy engine that decides what the meter is allowed to
            record, is still unclaimed. Governing token costs and pricing agentic work
            are the same curve read from opposite ends. You cannot budget what you
            cannot meter, and you cannot price what you cannot govern.
          </p>
        </div>
      </div>
    </section>
  );
}
