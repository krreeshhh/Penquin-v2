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
  title: "Penquin ● Hunt bugs, Not noise",
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
                // 1. Appearance / Theme
                const appearance = localStorage.getItem('vitepress-theme-appearance');
                const legacyTheme = localStorage.getItem('wotaku-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                // Default to DARK if no preference is stored
                const effective = (appearance === 'dark' || appearance === 'light')
                  ? appearance
                  : (legacyTheme === 'dark' || legacyTheme === 'light')
                    ? legacyTheme
                    : 'dark';

                if (effective === 'dark') {
                  document.documentElement.classList.add('dark');
                  // Pre-apply background color to both html and body to prevent white flash
                  const bg = '#1b1b1f';
                  document.documentElement.style.backgroundColor = bg;
                  if (document.body) document.body.style.backgroundColor = bg;
                }

                // 2. Layout Mode & Content Widths (to prevent layout flash)
                const LS = {
                  layoutMode: "vitepress-nolebase-enhanced-readabilities-layout-switch-mode",
                  legacyLayoutMode: "penquin-layout-mode",
                  contentMaxWidth: "vitepress-nolebase-enhanced-readabilities-content-layout-max-width",
                  docsContentMaxWidth: "penquin-docs-content-max-width",
                  legacyContentWidth: "penquin-content-width",
                  legacyDocsContentWidth: "penquin-docs-content-width",
                };

                const rawMode = localStorage.getItem(LS.layoutMode) || localStorage.getItem(LS.legacyLayoutMode);
                const isDocs = window.location.pathname !== '/' && !window.location.pathname.startsWith('/api');
                
                // Effective layout mode
                // Default docs/content pages to original width, keep home more expansive.
                let mode = isDocs ? "original" : "expandAll";
                if (rawMode === "1" || rawMode === "expandAll") mode = "expandAll";
                else if (rawMode === "3" || rawMode === "original") mode = "original";
                else if (rawMode === "4" || rawMode === "expandSidebar") mode = "expandSidebar";
                else if (rawMode === "5" || rawMode === "expandAllAdjustable") mode = "expandAllAdjustable";

                // Effective content width
                let width = isDocs ? 756 : 1152;
                if (mode === "expandAll") {
                   width = 1200;
                } else if (mode === "original") {
                   width = isDocs ? 756 : 1200;
                } else {
                   const stored = isDocs 
                     ? (localStorage.getItem(LS.docsContentMaxWidth) || localStorage.getItem(LS.contentMaxWidth) || localStorage.getItem(LS.legacyDocsContentWidth))
                     : (localStorage.getItem(LS.contentMaxWidth) || localStorage.getItem(LS.legacyContentWidth));
                   if (stored) width = Math.min(1200, Math.max(600, parseInt(stored) || (isDocs ? 756 : 1152)));
                }

                document.documentElement.style.setProperty("--content-max-width", width + "px");

                // 3. Mount animations
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
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
