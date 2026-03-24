import Hero from "@/components/sections/Hero";
import VisualThinking from "@/components/sections/VisualThinking";
import Products from "@/components/sections/Products";
import DesignerSection from "@/components/sections/DesignerSection";
import Support from "@/components/sections/Support";

export default function Home() {
  return (
    <article className="min-h-screen bg-white">
      {/* Sections */}
      <Hero />
      <VisualThinking />
      <Products />
      <DesignerSection />
      <Support />
    </article>
  );
}
