import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";
import { HomeShell } from "@/components/HomeShell";
import { getSidebarTree } from "@/lib/docs";

export default function Home() {
  const sidebar = getSidebarTree();

  return (
    <HomeShell sidebar={sidebar}>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <main className="flex-grow w-full pt-[64px]">
          <Hero />
          <Categories />
        </main>

        <Footer />
      </div>
    </HomeShell>
  );
}
