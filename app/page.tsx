import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Demo } from "@/components/Demo";
import { Instruments } from "@/components/Instruments";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Demo />
      <Problem />
      <Instruments />
      <Footer />
    </main>
  );
}
