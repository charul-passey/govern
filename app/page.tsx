import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Demo } from "@/components/Demo";
import { Instruments } from "@/components/Instruments";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Demo />
      <Instruments />
      <Footer />
    </main>
  );
}
