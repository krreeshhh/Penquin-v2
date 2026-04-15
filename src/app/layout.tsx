import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Wotaku - The Wotaku Index",
  description: "Websites for anime, manga, novels & tokusatsu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans")} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.iframe.ly" />
        <link rel="preconnect" href="https://wotaku.wiki" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://oreobiscuit.gitbook.io" />
        <link rel="preconnect" href="https://2149034102-files.gitbook.io" />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              const theme = localStorage.getItem('wotaku-theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
