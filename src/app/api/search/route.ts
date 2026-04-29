import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "src", "data");

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  emoji?: string;
  icon?: string;
  content?: string;
  category?: string;
  parentTitle?: string;
  breadcrumbs?: string[];
  priority: number;
  type: "page" | "section" | "heading";
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

function filePathToRoute(filePath: string) {
  const relativePath = path.relative(DATA_ROOT, filePath).replace(/\\/g, "/");
  return `/${relativePath.replace(/\/index\.json$/, "")}`;
}

function extractAllText(obj: unknown): string {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(extractAllText).join(' ');
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).map(extractAllText).join(' ');
  }
  return '';
}

function slugify(input: string) {
  if (!input) return "";
  return input.toLowerCase().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
}

function getCategoryFromPath(route: string): string {
  const parts = route.split('/').filter(Boolean);
  if (parts.length === 0) return 'Home';
  
  const categoryMap: Record<string, string> = {
    'recon': 'Reconnaissance',
    'exploitation': 'Exploitation',
    'enumeration': 'Enumeration',
    'post-exploitation': 'Post Exploitation',
    'learn-android-bug-bounty': 'Android Bug Bounty',
    'learn-game-hacking': 'Game Hacking',
    'exploiting-technologies': 'Technologies',
    'bug-bounty-reports-and-articles': 'Reports & Articles',
    'bug-bounty-platforms': 'Platforms',
    'mains': 'Resources',
  };
  
  for (const part of parts) {
    if (categoryMap[part]) return categoryMap[part];
  }
  
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

export async function GET() {
  const results: SearchResult[] = [];

  walkDir(DATA_ROOT, (filePath) => {
    if (!filePath.endsWith("index.json") || filePath.endsWith("sidebar.json")) return;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const route = filePathToRoute(filePath);
      const category = getCategoryFromPath(route);
      const pageTitle = data.title || "Untitled";

      // Main page result
      results.push({
        id: route,
        title: pageTitle,
        description: data.description || data.subtitle || "",
        url: route,
        emoji: data.emoji,
        icon: data.icon,
        content: data.sections ? extractAllText(data.sections) : "",
        category,
        type: "page",
        priority: 1,
      });

      // Section results
      if (Array.isArray(data.sections)) {
        for (const section of data.sections) {
          if (section.heading) {
            results.push({
              id: `${route}#${slugify(section.heading)}`,
              title: section.heading,
              description: `Section in ${pageTitle}`,
              url: `${route}#${slugify(section.heading)}`,
              emoji: data.emoji,
              icon: data.icon,
              category,
              parentTitle: pageTitle,
              breadcrumbs: [pageTitle, section.heading],
              content: extractAllText(section),
              type: "section",
              priority: 2,
            });
          }

          // Subheading results
          if (Array.isArray(section.subheadings)) {
            for (const sub of section.subheadings) {
              if (sub.heading) {
                const parentHeading = section.heading || "section";
                results.push({
                  id: `${route}#${slugify(`${parentHeading}-${sub.heading}`)}`,
                  title: sub.heading,
                  description: `Subsection in ${pageTitle}`,
                  url: `${route}#${slugify(`${parentHeading}-${sub.heading}`)}`,
                  emoji: data.emoji,
                  icon: data.icon,
                  category,
                  parentTitle: pageTitle,
                  breadcrumbs: [pageTitle, section.heading, sub.heading].filter(Boolean),
                  content: extractAllText(sub),
                  type: "heading",
                  priority: 3,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to parse ${filePath}`, e);
    }
  });

  return NextResponse.json(results);
}
