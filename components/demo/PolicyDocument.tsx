import type { PolicyCore } from "@/lib/policy-schema";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-panel px-2 py-0.5 font-mono text-xs text-ink/60">
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</h3>
      <div className="mt-2 space-y-1.5 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-ink/5 pb-1.5">
      <span className="text-ink/60">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

export function PolicyDocument({ policy }: { policy: PolicyCore }) {
  const b = policy.budgets;
  const company = b.company_envelope_usd_month;
  const multiple = b.benchmark.envelope_multiple_of_median;

  return (
    <div className="space-y-6">
      <Section title="Providers & models">
        {policy.providers.allowlist.map((p) => (
          <Row key={p.name} label={p.name}>
            {p.tier}
            {p.data_terms_reviewed ? " · terms reviewed" : " · terms pending"}
          </Row>
        ))}
        <Row label="Default routing">Efficient tier, frontier by exception</Row>
        <Row label="New provider">
          {policy.providers.new_provider_rule.action.replace(/_/g, " ")}
        </Row>
      </Section>

      <Section title="Budgets & variance bands">
        <Row label="Company envelope">
          {usd(company)}/mo
          <Chip>{multiple.toFixed(1)}× sector median</Chip>
        </Row>
        {b.team_envelopes.map((t) => (
          <div key={t.team} className="border-b border-ink/5 pb-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <span className="text-ink/60">{t.team}</span>
              <span className="text-right font-medium text-ink">
                {usd(t.usd_month)}/mo
                <Chip>{Math.round((t.usd_month / company) * 100)}% of envelope</Chip>
              </span>
            </div>
            <div className="mt-0.5 text-xs text-ink/50">
              {t.variance_band_pct}% variance band · {t.unit_cost_metric}
            </div>
          </div>
        ))}
        <Row label="Burn alert">{b.burn_alert_pct}% of envelope</Row>
      </Section>

      <Section title="Agent guardrails">
        <Row label="Max retries per task">{policy.agents.max_retries_per_task}</Row>
        <Row label="Max context growth per loop">
          {policy.agents.max_context_growth_pct_per_loop}%
        </Row>
        <Row label="Kill threshold">{usd(policy.agents.kill_threshold_usd_per_hour)}/hr</Row>
        <Row label="Agent card ceiling">
          {usd(policy.agents.agent_card.single_txn_ceiling_usd)} · {policy.agents.agent_card.merchant_scopes.join(", ")}
        </Row>
      </Section>

      <Section title="Shadow-AI rules">
        <Row label="AI charges on employee cards">
          {policy.shadow_ai.employee_card_ai_merchants}
        </Row>
        <Row label="Duplicate subscription threshold">
          {policy.shadow_ai.team_subscription_threshold} per team
        </Row>
        <p className="text-ink/70">{policy.shadow_ai.reimbursement_rule}</p>
      </Section>

      <Section title="Classification">
        <Row label="Default class">{policy.classification.default_class}</Row>
        {policy.classification.rules.map((r, i) => (
          <Row key={i} label={`${r.match.replace(/_/g, " ")} = ${r.value}`}>
            {r.class}
          </Row>
        ))}
      </Section>

      <Section title="Approvals">
        <Row label="Fine-tune over">{usd(policy.approvals.fine_tune_over_usd)}</Row>
        <Row label="Contract over">{usd(policy.approvals.contract_over_usd)}</Row>
        <Row label="New provider approver">{policy.approvals.new_provider_approver}</Row>
        <Row label="Frontier exception approver">
          {policy.approvals.frontier_exception_approver}
        </Row>
      </Section>

      <Section title="Anomaly response ladder">
        {policy.response_ladder.map((s) => (
          <div key={s.step} className="border-b border-ink/5 pb-1.5">
            <div className="flex items-baseline justify-between gap-x-4">
              <span className="font-medium text-ink">
                {s.step}. {s.action}
              </span>
              <span className="text-xs text-ink/50">
                {s.window_hours}h · {s.owner}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-ink/50">{s.trigger}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}
