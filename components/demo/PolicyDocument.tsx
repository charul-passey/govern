import type { PolicyCore } from "@/lib/policy-schema";
import { changedUnder } from "@/components/demo/diff";

// The seven section titles, in render order. Kept in sync with the <Section> titles
// below; the compact policy view lists these as collapsed rows.
export const SECTION_TITLES = [
  "Providers & models",
  "Budgets & variance bands",
  "Agent guardrails",
  "Shadow-AI rules",
  "Classification",
  "Approvals",
  "Anomaly response ladder",
] as const;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const FLASH = " animate-value-flash rounded-sm px-0.5";

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

function Row({
  label,
  flash,
  children,
}: {
  label: string;
  flash?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-ink/5 pb-1.5">
      <span className="text-ink/60">{label}</span>
      <span className={`text-right font-medium text-ink${flash ? FLASH : ""}`}>
        {children}
      </span>
    </div>
  );
}

export function PolicyDocument({
  policy,
  changed,
}: {
  policy: PolicyCore;
  changed: Set<string>;
}) {
  const b = policy.budgets;
  const company = b.company_envelope_usd_month;
  const multiple = b.benchmark.envelope_multiple_of_median;
  const chg = (path: string) => changedUnder(changed, path);

  return (
    <div className="space-y-6">
      <Section title="Providers & models">
        {policy.providers.allowlist.map((p, i) => (
          <Row key={p.name} label={p.name} flash={chg(`providers.allowlist.${i}`)}>
            {p.tier}
            {p.data_terms_reviewed ? " · terms reviewed" : " · terms pending"}
          </Row>
        ))}
        <Row label="Default routing">Efficient tier, frontier by exception</Row>
        <Row label="New provider" flash={chg("providers.new_provider_rule.action")}>
          {policy.providers.new_provider_rule.action.replace(/_/g, " ")}
        </Row>
      </Section>

      <Section title="Budgets & variance bands">
        <Row label="Company envelope" flash={chg("budgets.company_envelope_usd_month")}>
          {usd(company)}/mo
          <Chip>{multiple.toFixed(1)}× sector median</Chip>
        </Row>
        {b.team_envelopes.map((t, i) => (
          <div key={t.team} className="border-b border-ink/5 pb-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <span className="text-ink/60">{t.team}</span>
              <span
                className={`text-right font-medium text-ink${chg(`budgets.team_envelopes.${i}.usd_month`) ? FLASH : ""}`}
              >
                {usd(t.usd_month)}/mo
                <Chip>{Math.round((t.usd_month / company) * 100)}% of envelope</Chip>
              </span>
            </div>
            <div className="mt-0.5 text-xs text-ink/50">
              <span
                className={chg(`budgets.team_envelopes.${i}.variance_band_pct`) ? FLASH.trim() : ""}
              >
                {t.variance_band_pct}% variance band
              </span>{" "}
              · {t.unit_cost_metric}
            </div>
          </div>
        ))}
        <Row label="Burn alert" flash={chg("budgets.burn_alert_pct")}>
          {b.burn_alert_pct}% of envelope
        </Row>
      </Section>

      <Section title="Agent guardrails">
        <Row label="Max retries per task" flash={chg("agents.max_retries_per_task")}>
          {policy.agents.max_retries_per_task}
        </Row>
        <Row
          label="Max context growth per loop"
          flash={chg("agents.max_context_growth_pct_per_loop")}
        >
          {policy.agents.max_context_growth_pct_per_loop}%
        </Row>
        <Row label="Kill threshold" flash={chg("agents.kill_threshold_usd_per_hour")}>
          {usd(policy.agents.kill_threshold_usd_per_hour)}/hr
        </Row>
        <Row label="Agent card ceiling" flash={chg("agents.agent_card")}>
          {usd(policy.agents.agent_card.single_txn_ceiling_usd)} · {policy.agents.agent_card.merchant_scopes.join(", ")}
        </Row>
      </Section>

      <Section title="Shadow-AI rules">
        <Row
          label="AI charges on employee cards"
          flash={chg("shadow_ai.employee_card_ai_merchants")}
        >
          {policy.shadow_ai.employee_card_ai_merchants}
        </Row>
        <Row
          label="Duplicate subscription threshold"
          flash={chg("shadow_ai.team_subscription_threshold")}
        >
          {policy.shadow_ai.team_subscription_threshold} per team
        </Row>
        <p className={`text-ink/70${chg("shadow_ai.reimbursement_rule") ? FLASH : ""}`}>
          {policy.shadow_ai.reimbursement_rule}
        </p>
      </Section>

      <Section title="Classification">
        <Row label="Default class">{policy.classification.default_class}</Row>
        {policy.classification.rules.map((r, i) => (
          <Row key={i} label={`${r.match.replace(/_/g, " ")} = ${r.value}`} flash={chg(`classification.rules.${i}`)}>
            {r.class}
          </Row>
        ))}
      </Section>

      <Section title="Approvals">
        <Row label="Fine-tune over" flash={chg("approvals.fine_tune_over_usd")}>
          {usd(policy.approvals.fine_tune_over_usd)}
        </Row>
        <Row label="Contract over" flash={chg("approvals.contract_over_usd")}>
          {usd(policy.approvals.contract_over_usd)}
        </Row>
        <Row label="New provider approver" flash={chg("approvals.new_provider_approver")}>
          {policy.approvals.new_provider_approver}
        </Row>
        <Row
          label="Frontier exception approver"
          flash={chg("approvals.frontier_exception_approver")}
        >
          {policy.approvals.frontier_exception_approver}
        </Row>
      </Section>

      <Section title="Anomaly response ladder">
        {policy.response_ladder.map((s, i) => (
          <div
            key={s.step}
            className={`border-b border-ink/5 pb-1.5${chg(`response_ladder.${i}`) ? FLASH : ""}`}
          >
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
