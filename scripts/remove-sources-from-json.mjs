import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src", "data");
const REMOVE_KEYS = new Set(["source", "sources"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".json")) continue;
    handleJson(full);
  }
}

function stripKeys(value) {
  if (Array.isArray(value)) {
    for (const item of value) stripKeys(item);
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const key of Object.keys(value)) {
    if (REMOVE_KEYS.has(key)) {
      delete value[key];
      continue;
    }
    stripKeys(value[key]);
  }
}

let processed = 0;
let changed = 0;
let failed = 0;

function handleJson(filePath) {
  processed += 1;
  const raw = fs.readFileSync(filePath, "utf8");

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    failed += 1;
    // Keep going; surface all failures at the end.
    console.error(`[remove-sources] JSON parse failed: ${filePath}`);
    console.error(err?.message ?? String(err));
    return;
  }

  const before = JSON.stringify(data);
  stripKeys(data);
  const after = JSON.stringify(data);
  if (before === after) return;

  const pretty = `${JSON.stringify(data, null, 2)}\n`;
  fs.writeFileSync(filePath, pretty, "utf8");
  changed += 1;
}

walk(ROOT);

console.log(`[remove-sources] processed=${processed} changed=${changed} failed=${failed}`);
if (failed) process.exit(1);
