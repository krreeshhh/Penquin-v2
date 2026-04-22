import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "src", "data");

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

function extractAllText(obj: any): string {
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

export async function GET() {
  const results: any[] = [];

  walkDir(DATA_ROOT, (filePath) => {
    if (!filePath.endsWith("index.json") || filePath.endsWith("sidebar.json")) return;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const route = filePathToRoute(filePath);
      
      const pageTitle = data.title || "Untitled";

      // Main page result
      results.push({
        title: pageTitle,
        description: data.description || data.subtitle || "",
        url: route,
        emoji: data.emoji,
        icon: data.icon,
        content: data.sections ? extractAllText(data.sections) : "",
      });

      // Section and Subheading results
      if (Array.isArray(data.sections)) {
        for (const section of data.sections) {
          if (section.heading) {
            results.push({
              title: `${pageTitle} > ${section.heading}`,
              description: `Section in ${pageTitle}`,
              url: `${route}#${slugify(section.heading)}`,
              emoji: data.emoji,
              icon: data.icon,
              content: extractAllText(section),
            });
          }

          if (Array.isArray(section.subheadings)) {
            for (const sub of section.subheadings) {
              if (sub.heading) {
                const parentHeading = section.heading || "section";
                results.push({
                  title: `${pageTitle} > ${section.heading ? section.heading + " > " : ""}${sub.heading}`,
                  description: `Subsection in ${pageTitle}`,
                  url: `${route}#${slugify(`${parentHeading}-${sub.heading}`)}`,
                  emoji: data.emoji,
                  icon: data.icon,
                  content: extractAllText(sub),
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

