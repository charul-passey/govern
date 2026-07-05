import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Demo } from "@/components/Demo";
import { Instruments } from "@/components/Instruments";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header className="mx-auto max-w-shell px-6 pt-6">
        <span className="text-lg font-semibold text-ink">Govern</span>
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
