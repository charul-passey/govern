import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Demo } from "@/components/Demo";
import { Instruments } from "@/components/Instruments";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header id="top" className="px-6 pt-6">
        <div className="mx-auto max-w-shell">
          <a
            href="#top"
            className="rounded-sm text-base font-semibold text-ink no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Govern
          </a>
        </div>
      </header>
      <main>
        <Hero />
        <Problem />
        <Demo />
        <Instruments />
        <Footer />
      </main>
    </>
  );
}
