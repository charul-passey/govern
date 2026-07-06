"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MARK =
  "rounded-sm text-base font-semibold uppercase tracking-widest text-ink no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink";
const LINK =
  "rounded-sm underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink";

// Slim top nav, always visible. The wordmark scrolls to top on the home page and
// links home elsewhere. A subtle bottom border fades in once the page is scrolled.
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <nav
      className={`sticky top-0 z-40 h-12 border-b bg-ground px-6 transition-colors print:hidden ${
        scrolled ? "border-ink/10" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-shell items-center justify-between">
        {pathname === "/" ? (
          <button type="button" onClick={toTop} className={MARK} aria-label="Scroll to top">
            Govern
          </button>
        ) : (
          <Link href="/" className={MARK}>
            Govern
          </Link>
        )}
        <div className="flex items-center gap-4 text-sm text-ink/50">
          <Link href="/memo" className={LINK}>
            Memo
          </Link>
          <Link href="/build-log" className={LINK}>
            Build log
          </Link>
        </div>
      </div>
    </nav>
  );
}
