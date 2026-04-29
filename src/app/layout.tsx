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
  title: "Penquin - Hunt bugs, Not noise",
  description: "A no-BS index of resources, techniques, and field-tested workflows — for people in the field",
};

import { ConsoleSuppressor } from "@/components/ConsoleSuppressor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans")} suppressHydrationWarning>
      <ConsoleSuppressor />
      <head>
        <link rel="preconnect" href="https://cdn.iframe.ly" />
        <link rel="preconnect" href="https://wotaku.wiki" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://oreobiscuit.gitbook.io" />
        <link rel="preconnect" href="https://2149034102-files.gitbook.io" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                // Match wotaku.wiki semantics: 3-state appearance stored in localStorage.
                // Values: 'dark' | 'light' | 'auto' (default).
                const appearance = localStorage.getItem('vitepress-theme-appearance');
                const legacyTheme = localStorage.getItem('wotaku-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                const effective = (appearance === 'dark' || appearance === 'light')
                  ? appearance
                  : (legacyTheme === 'dark' || legacyTheme === 'light')
                    ? legacyTheme
                    : (prefersDark ? 'dark' : 'light');

                if (effective === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            })();

            (function() {
              try {
                // Only enable mount animations on initial document load.
                // Remove quickly so client-side navigations/redirections don't re-trigger them.
                document.documentElement.classList.add('enable-enter-animations');
                window.setTimeout(function() {
                  document.documentElement.classList.remove('enable-enter-animations');
                }, 800);
              } catch (e) {}
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
