import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-start pt-24 pb-12 w-full gap-8">
        <Hero />
        <Categories />
      </main>

      <Footer />
    </div>
  );
}
