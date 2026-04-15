import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, unknown>;

export type SidebarNode = {
  type: "page" | "group" | "divider";
  title: string;
  emoji?: string;
  icon?: string;
  url?: string;
  external?: boolean;
  children: SidebarNode[];
};

type LoadedDocs = {
  pages: Map<string, JsonRecord>;
  aliasRoutes: Map<string, string>;
  virtualPages: Map<string, JsonRecord>;
  sidebar: SidebarNode[];
  routes: string[];
};

const DATA_ROOT = path.join(process.cwd(), "src", "data");

let docsCache: LoadedDocs | null = null;

function walkDir(dir: string, callback: (filePath: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
      continue;
    }

    callback(fullPath);
  }
}

function filePathToRoute(filePath: string) {
  const relativePath = path.relative(DATA_ROOT, filePath).replace(/\\/g, "/");
  return `/${relativePath.replace(/\/index\.json$/, "")}`;
}

function stripTitleDecorations(value: string) {
  return value.replace(/^[^A-Za-z0-9]+/, "").trim();
}

function normalizeTitle(value: string) {
  return stripTitleDecorations(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonRecord;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function buildBreadcrumb(ancestors: Array<{ title: string; url?: string }>) {
  return ancestors
    .filter((ancestor) => ancestor.url)
    .map((ancestor) => ({ label: ancestor.title, url: ancestor.url }));
}

function inferGroupUrl(items: JsonRecord[]) {
  const childUrls = items
    .map((item) => item.url)
    .filter((value): value is string => typeof value === "string" && value.startsWith("/docs/"));

  if (!childUrls.length) return undefined;

  const candidate = path.posix.dirname(childUrls[0]);
  return childUrls.every((childUrl) => childUrl === candidate || childUrl.startsWith(`${candidate}/`)) ? candidate : undefined;
}

function normalizeUrl(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return url !== "/docs/" && url.endsWith("/") ? url.replace(/\/+$/, "") : url;
}

function loadDocs(): LoadedDocs {
  const shouldCache = process.env.NODE_ENV === "production";
  if (shouldCache && docsCache) return docsCache;

  const pages = new Map<string, JsonRecord>();
  const titleIndex = new Map<string, string[]>();

  walkDir(DATA_ROOT, (filePath) => {
    if (!filePath.endsWith("index.json") || filePath.endsWith("sidebar.json")) return;

    const data = readJson(filePath);
    const route = filePathToRoute(filePath);
    pages.set(route, data);

    if (typeof data.title === "string") {
      const key = normalizeTitle(data.title);
      const routes = titleIndex.get(key) ?? [];
      routes.push(route);
      titleIndex.set(key, routes);
    }
  });

  const aliasRoutes = new Map<string, string>();
  const virtualPages = new Map<string, JsonRecord>();
  const primarySidebarSource = readJson(path.join(DATA_ROOT, "sidebar.json"));
  const secondarySidebarPath = path.join(DATA_ROOT, "sidebar-2.json");
  const secondarySidebarSource = fs.existsSync(secondarySidebarPath) ? readJson(secondarySidebarPath) : null;

  const resolveRoute = (url?: string, title?: string) => {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl || /^https?:\/\//.test(normalizedUrl)) return normalizedUrl;
    if (pages.has(normalizedUrl) || virtualPages.has(normalizedUrl)) return normalizedUrl;

    if (title) {
      const matches = titleIndex.get(normalizeTitle(title)) ?? [];
      if (matches.length === 1) {
        aliasRoutes.set(normalizedUrl, matches[0]);
        return normalizedUrl;
      }
    }

    return normalizedUrl;
  };

  const buildSidebar = (
    items: JsonRecord[],
    ancestors: Array<{ title: string; url?: string }> = []
  ): SidebarNode[] => {
    return items.map((item) => {
      const emoji = typeof item.emoji === "string" ? item.emoji : undefined;
      const icon = typeof item.icon === "string" ? item.icon : undefined;

      if (item.type === "divider") {
        return {
          type: "divider",
          title: item.title as string,
          children: [],
          emoji: undefined,
          icon: undefined,
          url: undefined,
          external: undefined,
        };
      }

      const title = item.title as string;
      const pagesChildren = Array.isArray(item.pages) ? item.pages : [];
      const groupedChildren = Array.isArray(item.children) ? item.children : [];
      const rawChildren = [...pagesChildren, ...groupedChildren];
      const rawUrl = typeof item.url === "string" ? item.url : undefined;
      const nodeUrl = normalizeUrl(rawUrl ?? (item.type === "group" ? inferGroupUrl(rawChildren) : undefined));
      const currentAncestors = [...ancestors, { title, url: nodeUrl }];
      const children = buildSidebar(rawChildren, currentAncestors);
      const resolvedUrl = resolveRoute(nodeUrl, title);

      if (item.type === "group" && nodeUrl && !pages.has(nodeUrl) && !aliasRoutes.has(nodeUrl)) {
        virtualPages.set(nodeUrl, {
          title,
          description: `Browse ${title}.`,
          breadcrumb: buildBreadcrumb(ancestors),
          subtopics: children
            .filter((child) => child.url)
            .map((child) => ({
              emoji: child.emoji,
              icon: child.icon,
              title: child.title,
              url: child.url,
            })),
        });
      }

      return {
        type: item.type === "group" ? "group" : "page",
        title,
        emoji,
        icon,
        url: resolvedUrl ?? (item.type === "group" ? nodeUrl : undefined),
        external: item.external === true,
        children,
      };
    });
  };

  const primarySections = Array.isArray(primarySidebarSource.sections) ? primarySidebarSource.sections : [];
  const secondarySections = secondarySidebarSource && Array.isArray(secondarySidebarSource.sections)
    ? secondarySidebarSource.sections
    : [];

  const combinedSidebarSections = [
    { type: "divider", title: "Starters" },
    ...primarySections,
    ...(secondarySections.length ? [{ type: "divider", title: "Main Course" }, ...secondarySections] : []),
  ];

  const sidebar = buildSidebar(combinedSidebarSections);

  const routes = Array.from(
    new Set([...pages.keys(), ...aliasRoutes.keys(), ...virtualPages.keys()])
  ).sort();

  const loaded = {
    pages,
    aliasRoutes,
    virtualPages,
    sidebar,
    routes,
  } satisfies LoadedDocs;

  if (shouldCache) {
    docsCache = loaded;
  }

  return loaded;
}

export function getSidebarTree() {
  return loadDocs().sidebar;
}

export function getIntroductionRoutes() {
  return loadDocs().routes.filter((route) => route === "/docs" || route.startsWith("/docs/"));
}

export function getDocPage(route: string) {
  const docs = loadDocs();

  if (docs.pages.has(route)) return docs.pages.get(route) ?? null;

  const aliasedRoute = docs.aliasRoutes.get(route);
  if (aliasedRoute) return docs.pages.get(aliasedRoute) ?? null;

  return docs.virtualPages.get(route) ?? null;
}

export function routeToSlug(route: string) {
  const trimmed = route.replace(/^\/docs/, "").replace(/^\//, "");
  return trimmed ? trimmed.split("/") : [];
}

export function getPageDescription(page: JsonRecord) {
  const description = typeof page.description === "string" ? page.description : undefined;
  const subtitle = typeof page.subtitle === "string" ? page.subtitle : undefined;
  const introText = isRecord(page.content) && typeof page.content.introductoryText === "string" ? page.content.introductoryText : undefined;
  const value = description ?? subtitle ?? introText;
  return value;
}
