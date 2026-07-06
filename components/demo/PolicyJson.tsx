import { Fragment } from "react";
import type { PolicyCore } from "@/lib/policy-schema";

const KEY = "text-ink";
const STR = "text-ink/60";
const VAL = "text-ink/80";
const PUNC = "text-ink/40";

function flash(changed: Set<string>, path: string): string {
  return changed.has(path) ? " animate-value-flash rounded-sm px-0.5" : "";
}

function render(
  value: unknown,
  changed: Set<string>,
  path: string,
  indent: number,
): React.ReactNode {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (value === null) {
    return <span className={VAL + flash(changed, path)}>null</span>;
  }
  if (typeof value === "string") {
    return <span className={STR + flash(changed, path)}>{JSON.stringify(value)}</span>;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className={VAL + flash(changed, path)}>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={PUNC}>[]</span>;
    return (
      <>
        <span className={PUNC}>[</span>
        {"\n"}
        {value.map((item, i) => (
          <Fragment key={i}>
            {padIn}
            {render(item, changed, `${path}.${i}`, indent + 1)}
            {i < value.length - 1 ? <span className={PUNC}>,</span> : null}
            {"\n"}
          </Fragment>
        ))}
        {pad}
        <span className={PUNC}>]</span>
      </>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  return (
    <>
      <span className={PUNC}>{"{"}</span>
      {"\n"}
      {entries.map(([k, v], i) => (
        <Fragment key={k}>
          {padIn}
          <span className={KEY} data-json-path={path ? `${path}.${k}` : k}>
            {JSON.stringify(k)}
          </span>
          <span className={PUNC}>: </span>
          {render(v, changed, path ? `${path}.${k}` : k, indent + 1)}
          {i < entries.length - 1 ? <span className={PUNC}>,</span> : null}
          {"\n"}
        </Fragment>
      ))}
      {pad}
      <span className={PUNC}>{"}"}</span>
    </>
  );
}

export function PolicyJson({
  policy,
  changed,
}: {
  policy: PolicyCore;
  changed: Set<string>;
}) {
  return (
    <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ink/80">
      {render(policy, changed, "", 0)}
    </pre>
  );
}
