import fs from "node:fs";
import path from "node:path";
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { TrackOnMount } from "@/components/TrackOnMount";

export const metadata: Metadata = {
  title: "The governance gap · Govern",
  description:
    "Why the next chapter of AI spend management is policy, and why the window is now.",
};

// Superscript footnote markers used in the memo, mapped to their source number.
const SUP: Record<string, string> = {
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

// Replace superscript chars in a text run with links into the sources list.
function withFootnotes(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let i = 0;
  for (const ch of text) {
    const n = SUP[ch];
    if (n) {
      if (buf) {
        out.push(buf);
        buf = "";
      }
      out.push(
        <a
          key={`${keyBase}-${i}`}
          href={`#source-${n}`}
          aria-label={`Source ${n}`}
          className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <sup className="ml-0.5 font-normal text-ink/50 hover:text-ink">{n}</sup>
        </a>,
      );
    } else {
      buf += ch;
    }
    i++;
  }
  if (buf) out.push(buf);
  return out;
}

// Inline rendering: bold (**...**) plus footnote superscripts.
function inline(text: string, keyBase: string): ReactNode[] {
  return text.split("**").map((seg, idx) =>
    idx % 2 === 1 ? (
      <strong key={`${keyBase}-b${idx}`} className="font-semibold text-ink">
        {withFootnotes(seg, `${keyBase}-b${idx}`)}
      </strong>
    ) : (
      <Fragment key={`${keyBase}-n${idx}`}>{withFootnotes(seg, `${keyBase}-n${idx}`)}</Fragment>
    ),
  );
}

export default function MemoPage() {
  const raw = fs.readFileSync(path.join(process.cwd(), "content/memo.md"), "utf8");
  const lines = raw.split("\n");

  const body: ReactNode[] = [];
  const sources: { n: string; text: string }[] = [];
  let disclaimer: string | null = null;
  let mode: "body" | "sources" = "body";
  let beforeFirstHr = true;

  lines.forEach((line, idx) => {
    const t = line.replace(/\s+$/, "");
    const key = `l${idx}`;
    if (t.trim() === "") return;

    if (t.startsWith("### ")) {
      body.push(
        <p key={key} className="mt-3 text-lg text-ink/60">
          {inline(t.slice(4), key)}
        </p>,
      );
    } else if (t.startsWith("## ")) {
      body.push(
        <h2 key={key} className="mt-12 text-2xl font-bold tracking-tight text-ink">
          {inline(t.slice(3), key)}
        </h2>,
      );
    } else if (t.startsWith("# ")) {
      body.push(
        <h1 key={key} className="text-4xl font-extrabold tracking-tight text-ink">
          {inline(t.slice(2), key)}
        </h1>,
      );
    } else if (t === "---") {
      beforeFirstHr = false;
      body.push(<hr key={key} className="my-10 border-0 border-t border-ink/10" />);
    } else if (t === "**Sources**") {
      mode = "sources";
    } else if (mode === "sources" && /^\d+\.\s+/.test(t)) {
      const m = t.match(/^(\d+)\.\s+(.*)$/);
      if (m) sources.push({ n: m[1], text: m[2] });
    } else if (t.startsWith("*") && !t.startsWith("**") && t.endsWith("*")) {
      disclaimer = t.slice(1, -1);
    } else if (beforeFirstHr) {
      body.push(
        <p key={key} className="mt-4 font-mono text-sm text-ink/50">
          {inline(t, key)}
        </p>,
      );
    } else {
      body.push(
        <p key={key} className="mt-6 text-lg leading-relaxed text-ink/80">
          {inline(t, key)}
        </p>,
      );
    }
  });

  return (
    <main className="memo mx-auto max-w-prose px-6 py-16">
      <TrackOnMount event="memo_opened" />
      <nav className="mb-12 print:hidden">
        <Link
          href="/"
          className="rounded-sm font-mono text-sm text-ink/50 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          ← Govern
        </Link>
      </nav>

      <article>{body}</article>

      <section className="mt-12 break-before-page">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Sources</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink/60 marker:text-ink/40">
          {sources.map((s) => (
            <li key={s.n} id={`source-${s.n}`} className="pl-1">
              {inline(s.text, `src-${s.n}`)}
            </li>
          ))}
        </ol>
        {disclaimer && (
          <p className="mt-8 text-sm italic text-ink/50">{inline(disclaimer, "disclaimer")}</p>
        )}
      </section>
    </main>
  );
}
