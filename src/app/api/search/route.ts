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

export async function GET() {
  const results: any[] = [];

  walkDir(DATA_ROOT, (filePath) => {
    if (!filePath.endsWith("index.json") || filePath.endsWith("sidebar.json")) return;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const route = filePathToRoute(filePath);

      results.push({
        title: data.title || "Untitled",
        description: data.description || data.subtitle || "",
        url: route,
        emoji: data.emoji,
        icon: data.icon,
      });
    } catch (e) {
      console.error(`Failed to parse ${filePath}`, e);
    }
  });

  return NextResponse.json(results);
}
