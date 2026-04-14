import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--vp-c-bg)]">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[64px] font-bold text-[var(--vp-c-text-1)] leading-none italic tracking-tighter mb-4">
          404
        </h1>
        <p className="text-[18px] text-[var(--vp-c-text-2)] mb-8 max-w-md antialiased font-medium">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-8 py-3 rounded-full bg-[var(--vp-c-brand-1)] hover:bg-[var(--vp-c-brand-2)] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--vp-c-brand-1)]/20"
        >
          Take Me Home
        </Link>
      </main>
    </div>
  );
}
